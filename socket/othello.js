var game_expire = 19200; // second
var waiting_expire = 600; // second
var async = require('async');
var io;
var color_white = 1;
var color_black = 2;
var Board = require('../public/js/othello/board.js').Board;

var board = new Board(color_black);

var move = function(socket, data) {
    console.log('move #', JSON.stringify(data));
    board.board = data.board;
    board.turn = data.turn;
    var row = data.row;
    var col = data.col;
    if (row >= 0 && col >=0 && !board.check(row, col)) {
        socket.emit('_error', 'error move');
    } else {
        console.log('send move to #' + socket.rooms[socket.rooms.length - 1]);
        io.to(socket.rooms[socket.rooms.length - 1]).emit('move', data);
    }
}

var new_game = function(socket, id) {
    console.log('new_game #' + id);
    socket.emit('new_game');
    socket.on('new_game', function(data) {
        if (!data || !typeof(data) === 'object' || !data['color'] || !data['nickname']) {
            socket.emit('_error', 'error start new game.');
            return;
        }
        var color = parseInt(data.color);
        if (!color) color = color_black;
        var nickname = data.nickname;
        console.log('new game with ' + JSON.stringify(data));
        async.series([
            function(callback) {
                global.client.set('game_status#' + id, 'waiting', 'EX', waiting_expire, callback);
            },
            function(callback) {
                global.client.set('play_info#' + id, JSON.stringify({color: color, nickname: nickname}), 'EX', waiting_expire, callback);
            }
        ], function(err, results) {
            socket.join(id);
            socket.emit('wait');
        });
    });
}

var join_game = function(socket, id, room) {
    console.log('join game #' + id + '# #' + room);
    socket.emit('join_game');
    socket.on('join_game', function(data) {
        if (!data || !typeof(data) === 'object' || !data['nickname']) {
            socket.emit('_error', 'error join game.');
            return;
        }
        var nickname = data.nickname;
        console.log('join game with ' + JSON.stringify(data));
        async.series([
            function(callback) {
                global.client.set('game_status#' + room, 'playing', 'EX', game_expire, callback);
            },
            function(callback) {
                global.client.set('game_members#' + room, JSON.stringify([id, room]), 'EX', game_expire, callback);
            },
            function(callback) {
                global.client.get('play_info#' + room, callback);
            },
            function(callback) {
                global.client.set('play_info#' + id, JSON.stringify({nickname: nickname}), 'EX', waiting_expire, callback);
            }
        ], function(err, results) {
            socket.join(room);
            var info = JSON.parse(results[2]);
            console.log(JSON.stringify(results[2]));
            var color = parseInt(info.color);
            if (!color) color = color_black;
            var color_data = {};
            color_data[room] = color;
            color_data[id] = 3 - color;
            console.log('game start #' + room + '# #' + JSON.stringify(color_data));
            io.to(room).emit('start', color_data);
        });
    });
}

var reconnect = function(socket, id, room) {
    console.log('reconnect #' + id + '# #' + room);
    global.client.get('game_member#' + id, function(err, member) {
        var members = JSON.parse(member);
        if (!members || !members.length) {
            socket.emit('_error', 'room not exist');
            return;
        }
        var is_member = false;
        for (var i = 0; i < members.length; i++) {
            if (members[i] == id) {
                is_member = true;
            }
        }
        if (!is_member) {
            socket.emit('_error', 'not member of room');
            return;
        }
    });
    // sync
}

exports.connect = function(nsp) {
    io = nsp;
    nsp.on('connection', function(socket) {
        console.log('#' + socket.id + ' connect');
        socket.emit('id', socket.id);
        socket.on('disconnect', function() {
            console.log('#' + socket.id + ' disconnect');
        });
        socket.on('info', function(info) {
            console.log('info #' + JSON.stringify(info));
            if (!info || !info['id']) {
                socket.emit('_error', 'info is empty');
                return;
            }
            var id = info['id'];
            if (!info['room']) {
                //none
                new_game(socket, id);
                return;
            }
            var room = info['room'];
            global.client.get('game_status#' + room, function(err, game) {
                if (err) {
                    socket.emit('_error', 'data error');
                    return;
                }
                console.log(game);
                if (!game) {
                    //none
                    new_game(socket, id);
                } else if (game === 'none') {
                    new_game(socket, id);
                } else if (game === 'waiting') {
                    // join game
                    join_game(socket, id, room);
                } else if (game === 'playing') {
                    // reconnect
                    reconnect(socket, id, room);
                }
            });
        });
        socket.on('move', function(data){
            if (!data || !typeof(data) === 'object' || !Number.isInteger(data['row']) || !Number.isInteger(data['col']) || !data['board'] || !Number.isInteger(data['turn'])) {
                socket.emit('_error', 'move error');
            }
            move(socket, data);
        });
    });
};