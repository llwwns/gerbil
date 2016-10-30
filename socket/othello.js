const game_expire = 19200; // second
const waiting_expire = 600; // second
const generate_room_number = require('../utility').generate_room_number;
const co = require("co")
let io;
const color_white = 1;
const color_black = 2;
const Board = require('../public/js/othello/board').Board;

let board = new Board(color_black);

const move = (socket, data) => {
    //console.log('move #', JSON.stringify(data));
    board.board = data.board;
    board.turn = data.turn;
    let row = data.row;
    let col = data.col;
    if (row >= 0 && col >=0 && !board.check(row, col)) {
        socket.emit('_error', 'error move');
    } else {
        let rooms = Object.keys(socket.rooms).map((k) => socket.rooms[k]);
        console.log('send move to #' + rooms[rooms.length - 1]);
        let room = rooms[rooms.length - 1];
        io.to(room).emit('move', data);
        co(function*() {
            yield [global.client.rpushAsync('move_log#' + room, JSON.stringify([row, col])),
                global.client.expireAsync('move_log#' + room, game_expire)];
        }).catch((err) => {
            console.log(err);
            socket.emit('_error', JSON.stringify(err));
        });
    }
};

const new_game = (socket, id) => {
    console.log('new_game #' + id);
    socket.emit('new_game');
    socket.on('new_game', (data) => {
        if (!data || !typeof(data) === 'object' || !data['color'] || !data['nickname']) {
            socket.emit('_error', 'error start new game.');
            return;
        }
        let color = parseInt(data.color);
        if (!color) color = color_black;
        let nickname = data.nickname;
        let room = generate_room_number();
        console.log('new game with ' + JSON.stringify(data));
        co(function*(){
            yield [global.client.setAsync('game_status#' + room, 'waiting', 'EX', waiting_expire)
                ,global.client.setAsync('play_info#' + id, JSON.stringify({color: color, nickname: nickname}), 'EX', waiting_expire + game_expire)
                ,global.client.setAsync('game_info#' + room, JSON.stringify({id: id, color: color, nickname: nickname}), 'EX', waiting_expire + game_expire)
                ,global.client.delAsync('move_log#' + room)
                ,global.client.delAsync('game_members#' + room)];
        }).then(() => {
            socket.join(room);
            socket.emit('wait', room);
        }).catch((err) => {
            console.log(err);
        });
    });
};

const join_game = (socket, id, room) => {
    console.log('join game #' + id + '# #' + room);
    socket.emit('join_game', room);
    socket.on('join_game', (data) => {
        if (!data || !typeof(data) === 'object' || !data['nickname']) {
            socket.emit('_error', 'error join game.');
            return;
        }
        let nickname = data.nickname;
        console.log('join game with ' + JSON.stringify(data));
        co(function*() {
            yield [global.client.setAsync('game_status#' + room, 'playing', 'EX', game_expire),
                global.client.setAsync('play_info#' + id, JSON.stringify({nickname: nickname}), 'EX', game_expire)];
            let game_info = yield global.client.getAsync('game_info#' + room);
            socket.join(room);
            let info = JSON.parse(game_info);
            if (info.id == id) {
                socket.emit('_error', 'cannot join self game.');
                return;
            }
            let color = parseInt(info.color);
            if (!color) color = color_black;
            let color_data = {};
            color_data[info.id] = color;
            color_data[id] = 3 - color;
            console.log('game start #' + room + '# #' + JSON.stringify(color_data));
            io.to(room).emit('start', color_data);
            global.client.set('game_members#' + room, JSON.stringify([info.id, id]), 'EX', game_expire);
        }).catch((err) => {
            console.log(err);
        });
    });
}

const reconnect = (socket, id, room) => {
    console.log('reconnect #' + id + '# #' + room);
    co(function*() {
        let members = JSON.parse(yield client.getAsync('game_members#' + room));
        if (!members || !members.length) {
            socket.emit('_error', 'room not exist');
            return;
        }
        let is_member = false;
        for (let i = 0; i < members.length; i++) {
            if (members[i] == id) {
                is_member = true;
            }
        }
        if (!is_member) {
            socket.emit('_error', 'room is full');
            return;
        }
        let logs = yield global.client.lrangeAsync('move_log#' + room, 0, -1);
        let info = JSON.parse(yield global.client.getAsync('play_info#' + id));
        let game_info = JSON.parse(yield global.client.getAsync('game_info#' + room));
        info.color = (game_info.id == id) ? game_info.color : (3 - game_info.color);
        socket.join(room);
        socket.emit('reconnect', {info: info, log: logs});
    }).catch((err) => {
        console.log(err);
        new_game(socket, id);
    });
}

exports.connect = (nsp) => {
    io = nsp;
    nsp.on('connection', (socket) => {
        console.log('#' + socket.id + ' connect');
        socket.emit('id', socket.id);
        socket.on('disconnect', () => {
            console.log('#' + socket.id + ' disconnect');
        });
        socket.on('info', (info) => {
            console.log('info #' + JSON.stringify(info));
            if (!info || !info['id']) {
                socket.emit('_error', 'info is empty');
                return;
            }
            let id = info['id'];
            if (!info['room']) {
                //none
                new_game(socket, id);
                return;
            }
            let room = info['room'];
            co(function*() {
                let game = yield global.client.getAsync('game_status#' + room);
                console.log(game);
                if (!game) {
                    //none
                    new_game(socket, id);
                } else if (game === 'none') {
                    new_game(socket, id);
                } else if (game === 'waiting') {
                    // join game
                    if (id == room) {
                        new_game(socket, id);
                    } else {
                        join_game(socket, id, room);
                    }
                } else if (game === 'playing') {
                    // reconnect
                    reconnect(socket, id, room);
                }
            }).catch((err) => {
                socket.emit('_error', 'data error');
                return;
            });
        });
        socket.on('move', (data) => {
            if (!data || !typeof(data) === 'object' || typeof data['row'] != "number" || typeof data['col'] != "number" || !data['board'] || typeof data['turn'] != "number") {
                socket.emit('_error', 'move error' + typeof data['col']);
            }
            move(socket, data);
        });
        socket.on('chat', (data) => {
            if (!data || !typeof(data) === 'object' || !data.message || data.message.length > 256) {
                socket.emit('_error', 'chat send error');
            }
            let rooms = Object.keys(socket.rooms).map((k) => socket.rooms[k]);
            let room = rooms[rooms.length - 1];
            console.log('message send#', JSON.stringify(data));
            io.to(room).emit('chat', data);
        });
    });
};
