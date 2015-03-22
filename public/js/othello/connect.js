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
        var room = $.cookie('othello#room');
        if (room) {
            socket.emit('info', {
                id: id,
                room: room
            });
        } else if (typeof join_id !== 'undefined' && join_id) {
            socket.emit('info', {
                id: id,
                room: join_id
            });
        } else {
            socket.emit('info', {
                id: id
            });
        }
    });
    socket.on('new_game', function(data) {
        game.newGame();
    });
    socket.on('join_game', function(data) {
        game.joinGame();
    });
    socket.on('wait', function() {
        game.wait(this.id);
    });
    socket.on('start', function(data) {
        game.start(data[this.id]);
    });
    socket.on('move', function(data) {
        game.move(data);
    });
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
