function Connection() {
}
Connection.prototype.connect = function(game) {
    socket = io(location.host + '/othello');
    this.socket = socket;
    socket.on('_error', function(data) {
        alert(data);
    });
    socket.on('id', function(data) {
        var id = $.cookie('othello#id');
        if (!id) {
            id = data;
            $.cookie('othello#id', id);
        }
        this.id = id;
        if (typeof join_id !== 'undefined' && join_id) {
            socket.emit('info', {
                id: id,
                room: join_id
            });
        } else {
            var room = $.cookie('othello#room');
            if (room) {
                socket.emit('info', {
                    id: id,
                    room: room
                });
            } else {
                socket.emit('info', {
                    id: id
                });
            }
        }
    });
    socket.on('new_game', function(data) {
        game.newGame();
    });
    socket.on('join_game', function(data) {
        game.joinGame();
        $.cookie('othello#room', data);
    });
    socket.on('wait', function(data) {
        game.wait(data);
        $.cookie('othello#room', data);
    });
    socket.on('start', function(data) {
        game.start(data[this.id]);
    });
    socket.on('move', function(data) {
        game.move(data);
    });
    socket.on('chat', function(data) {
        game.chat(data);
    });
    socket.on('reconnect', function(data) {
        if (data) {
            game.reconnect(data);
        }
    });
};
Connection.prototype.newGame = function() {
    if (!this.socket.id) {
        alert('error');
    } else {
        var socket = this.socket;
        socket.emit('info', {
            id: socket.id
        });
    }
};
Connection.prototype.newGameSend = function(color, nickname) {
    var socket = this.socket;
    socket.emit('new_game', {color: color, nickname: nickname});
};
Connection.prototype.joinGameSend = function(nickname) {
    var socket = this.socket;
    socket.emit('join_game', {nickname: nickname});
};
Connection.prototype.moveSend = function(board, turn, row, col) {
    var socket = this.socket;
    socket.emit('move', {
        board: board,
        turn: turn,
        row: row,
        col: col
    });
};
Connection.prototype.chatSend = function(message) {
    var socket = this.socket;
    socket.emit('chat', message);
};
