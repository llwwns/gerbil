class Connection {
    connect(game) {
        let socket = io(location.host + '/othello');
        this.socket = socket;
        socket.on('_error', (data) => alert(data));
        socket.on('id', (data) => {
            let id = $.cookie('othello#id');
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
                let room = $.cookie('othello#room');
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
        socket.on('new_game', (data) => game.newGame());
        socket.on('join_game', (data) => {
            game.joinGame();
            $.cookie('othello#room', data);
        });
        socket.on('wait', (data) => {
            game.wait(data);
            $.cookie('othello#room', data);
        });
        socket.on('start', (data) => {
            console.log(data);
            console.log(this.id);
            game.start(data[this.id]);
        });
        socket.on('move', (data) => {
            game.move(data);
        });
        socket.on('chat', (data) => {
            game.chat(data);
        });
        socket.on('reconnect', (data) => {
            if (data) {
                game.reconnect(data);
            }
        });
    }
    newGame() {
        if (!this.id) {
            alert('error');
        } else {
            let socket = this.socket;
            socket.emit('info', {
                id: this.id
            });
        }
    }
    newGameSend(color, nickname) {
        let socket = this.socket;
        socket.emit('new_game', {color: color, nickname: nickname});
    }
    joinGameSend(nickname) {
        let socket = this.socket;
        socket.emit('join_game', {nickname: nickname});
    }
    moveSend(board, turn, row, col) {
        let socket = this.socket;
        socket.emit('move', {
            board: board,
            turn: turn,
            row: row,
            col: col
        });
    }
    chatSend(message) {
        let socket = this.socket;
        socket.emit('chat', message);
    }
}
