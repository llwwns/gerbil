const colors = {
    white: 1,
    black: 2,
};
const game_status = {
    normal    : 0,
    pass      : 1,
    game_over : 2
}

const showCell = (bk, $e) => {
    $e.css('background', bk).transition({
        rotateY: '90deg'
    }, 0).transition({
        rotateY: '0'
    }, 300);
};
const getFormObj = (form) => {
    let formObj = {};
    let inputs = form.serializeArray();
    $.each(inputs, (i, input) => {
        formObj[input.name] = input.value;
    });
    return formObj;
}
class Game {
    constructor() {
        $('#game-board').html('');
        this.messages = ko.observableArray([]);
        this.nickname = ko.observable('');
        this.message = ko.observable('');
        this.color = ko.observable('2');
        this.$cell_array =[];
    }
    drawGameBoard() {
        let size = Board.getSize();
        this.deleteGameBoard();
        let html = '<table><tr><th></th>';
        html += 'abcdefgh'.replace(/(.)/g, '<th>$1</th>');
        html += '</tr>';
        let index = 0;
        for (let y = 0; y < size; y++) {
            html += `<tr><th>${y + 1}</th>`;
            for (let x = 0; x < size; x++) {
                html += `<td class="cell" row="${y}" col="${x}"><div></div></td>`;
            }
            html += '</tr>';
        }
        html += '</table>';
        $('#game-board').html(html);
        let $elements = $('td.cell');
        this.$cell_array =[];
        for (let i = 0; i < $elements.length; i++) {
            let $element = $($elements[i]);
            let row = parseInt($element.attr('row'));
            let col = parseInt($element.attr('col'));
            if (!this.$cell_array[row]) {
                this.$cell_array[row] = [];
            }
            this.$cell_array[row][col] = $element.find('div');
        }
        $('.cell').on('click',(e) => {
            let $target = $(e.target);
            if ($target.is("div")) {
                $target = $target.parent();
            }
            let row = parseInt($target.attr('row'));
            let col = parseInt($target.attr('col'));
            console.log(`row = ${row}, col = ${col}`);
            if (this.enable && this.board.isMyTurn() && this.board.check(row, col)) {
                console.log("send");
                this.enable = false;
                this.createMove(row, col);
            } else if (!this.enable) {
            }
        });
    }
    deleteGameBoard() {
        $('#game-board').html('');
    }
    show(row, col, clr) {
        let bk = (clr == colors.black) ? '#000' : '#fff'; 
        showCell(bk, this.$cell_array[row][col]);
    }
    setBoard(board) {
        this.board = board;
        board.each((val, row, col) => {
            if (val > 0) {
                this.show(row, col, val);
            }
        });
    }
    showLeagleGirds() {
        this.legalGirds = this.board.getLegalGirds();
        if (this.legalGirds.length > 0) {
            this.game_status = game_status.normal;
            for (let i = 0; i < this.legalGirds.length; i++) {
                this.$cell_array[this.legalGirds[i][0]][this.legalGirds[i][1]].html('&times;');
            }
        } else {
            this.board.pass();
            if (this.board.getLegalGirds().length === 0) {
                this.game_status = game_status.game_over;
            } else {
                this.game_status = game_status.pass;
            }
            this.board.pass();
        }
    }
    clearLeagleGirds() {
        if (this.legalGirds) {
            for (let i = 0; i < this.legalGirds.length; i++) {
                this.$cell_array[this.legalGirds[i][0]][this.legalGirds[i][1]].html('');
            }
        }
    }
    newGame() {
        //$('#newGameButton').show();
        $('#newGame').modal('show');
    }
    joinGame() {
        $('#joinGameButton').show();
        $('#joinGame').modal('show');
    }
    wait(id) {
        this.deleteGameBoard();
        $('#wait_info').show();
        $('#wait_info>.well').text('http://' + location.host + '/othello/' + id);
        $('#wait_info>.qrcode').html('').qrcode({"width" : 300, "height" : 300, "text" : $('#wait_info>.well').text()});
    }
    start(color) {
        console.log("start");
        //$('#newGameButton').hide();
        $('#joinGameButton').hide();
        $('#wait_info').hide();
        this.enable = true;
        this.drawGameBoard();
        let board = new Board(color);
        this.setBoard(board);
        this.showLeagleGirds();
        $('#chat').show();
    }
    createMove(row, col) {
        this.connection.moveSend(this.board.board, this.board.turn, row, col);
    }
    move(data) {
        if (!this.board.isSame(data.board, data.turn)) {
            //sync
        }
        this.enable = true;
        this.clearLeagleGirds();
        let row = data.row;
        let col = data.col;
        let turnedGird = this.board.put(row, col);
        if (row !== -1 && col !== -1) {
            this.show(row, col, this.board.get(row, col));
            for (let i = 0; i < turnedGird.length; i++) {
                let r = turnedGird[i][0];
                let c = turnedGird[i][1];
                this.show(r, c, this.board.get(r, c));
            }
        }
        this.showLeagleGirds();
        if (this.game_status === game_status.pass && this.board.isMyTurn()) {
            $('#pass').modal('show');
        } else if(this.game_status === game_status.game_over) {
            let cmp = this.board.compare();
            if (cmp > 0) {
                $('#win').modal('show');
            } else if (cmp === 0) {
                $('#draw').modal('show');
            } else {
                $('#lose').modal('show');
            }
        }
    }
    reconnect(data) {
        let info = data.info;
        let log = data.log;
        if (!info) return;
        //$('#newGameButton').hide();
        $('#joinGameButton').hide();
        $('#wait_info').hide();
        this.nickname(info.nickname);
        this.enable = true;
        this.drawGameBoard();
        let board = new Board(info.color);
        if (log && log.length) {
            for (let i = 0; i < log.length; i++) {
                let move = JSON.parse(log[i]);
                board.put(move[0], move[1]);
            }
        }
        this.setBoard(board);
        this.showLeagleGirds();
        $('#chat').show();
    }
    newGameSend(e) {
        let nickname = this.nickname();
        let color = this.color();
        if (!nickname || nickname.length > 64) {
            alert('nickname is empty or too long.');
            return false;
        }
        this.connection.newGameSend(color, nickname);
        //$('#newGameButton').hide();
        $('#newGame').modal('hide');
        return false;
    }
    joinGameSend(e) {
        let nickname = this.nickname();
        if (!nickname || nickname.length > 64) {
            alert('nickname is empty or too long.');
            return false;
        }
        this.connection.joinGameSend(nickname);
        $('#joinGameButton').hide();
        $('#joinGame').modal('hide');
        return false;
    }
    chatSend(e) {
        let message = this.message();
        let nickname = this.nickname();
        this.message('');
        if (!message || message.length > 256) {
            alert('message is empty or too long.');
            return false;
        }
        this.connection.chatSend({
            name: nickname,
            message: message
        });
        return false;
    }
    chat(msg) {
        this.messages.unshift(msg);
    }
}
$(() => {
    //$('#newGameButton').hide();
    $('#joinGameButton').hide();
    $('#chat').hide();
    $('#wait_info').hide();
    let game = new Game();
    let connection = new Connection();
    connection.connect(game);
    game.connection = connection;
    $('#pass').on('hide.bs.modal', (e) => {
        game.createMove(-1, -1);
    });
    $('#newGameButton').click(() => {
        connection.newGame();
    });
    ko.applyBindings(game);
});

