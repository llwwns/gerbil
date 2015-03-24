colors = {
    white: 1,
    black: 2,
};
game_status = {
    normal    : 0,
    pass      : 1,
    game_over : 2
}

var showCell = function(bk, $e) {
    $e.css('background', bk).transition({
        rotateY: '90deg'
    }, 0).transition({
        rotateY: '0'
    }, 300);
};
var getFormObj = function(form) {
    var formObj = {};
    var inputs = form.serializeArray();
    $.each(inputs, function (i, input) {
        formObj[input.name] = input.value;
    });
    return formObj;
}
function Game() {
    $('#game-board').html('');
};
var size = 8;
Game.prototype.drawGameBoard = function() {
    this.deleteGameBoard();
    var html = '<table><tr><th></th>';
    html += 'abcdefgh'.replace(/(.)/g, '<th>$1</th>');
    html += '</tr>';
    var index = 0;
    for (var y = 0; y < size; y++) {
        html += '<tr><th>' + (y + 1) + '</th>';
        for (var x = 0; x < size; x++) {
            html += '<td class="cell" row="' + y + '" col="' + x + '"><div></div></td>';
        }
        html += '</tr>';
    }
    $('#game-board').html(html);
    var $elements = $('td.cell');
    this.$cell_array =[];
    for (var i = 0; i < $elements.length; i++) {
        $element = $($elements[i]);
        var row = parseInt($element.attr('row'));
        var col = parseInt($element.attr('col'));
        if (!this.$cell_array[row]) {
            this.$cell_array[row] = [];
        }
        this.$cell_array[row][col] = $element.find('div');
    }
    html += '</table>';
    var game = this;
    $('.cell').click(function() {
        var row = parseInt($(this).attr('row'));
        var col = parseInt($(this).attr('col'));
        if (game.enable && game.board.isMyTurn() && game.board.check(row, col)) {
            game.enable = false;
            game.createMove(row, col);
        } else if (!game.enable) {
        }
    });
};
Game.prototype.deleteGameBoard = function() {
    $('#game-board').html('');
}
Game.prototype.show = function(row, col, clr) {
    var bk = (clr == colors.black) ? '#000' : '#fff'; 
    showCell(bk, this.$cell_array[row][col]);
};
Game.prototype.setBoard = function(board) {
    this.board = board;
    var game = this;
    board.each(function(val, row, col) {
        if (val > 0) {
            game.show(row, col, val);
        }
    });
};
Game.prototype.showLeagleGirds = function() {
    this.legalGirds = this.board.getLegalGirds();
    if (this.legalGirds.length > 0) {
        this.game_status = game_status.normal;
        for (var i = 0; i < this.legalGirds.length; i++) {
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
};
Game.prototype.clearLeagleGirds = function() {
    if (this.legalGirds) {
        for (var i = 0; i < this.legalGirds.length; i++) {
            this.$cell_array[this.legalGirds[i][0]][this.legalGirds[i][1]].html('');
        }
    }
};
Game.prototype.newGame = function() {
    //$('#newGameButton').show();
    $('#newGame').modal('show');
};
Game.prototype.joinGame = function() {
    $('#joinGameButton').show();
    $('#joinGame').modal('show');
};
Game.prototype.wait = function(id) {
    this.deleteGameBoard();
    $('#wait_info').show();
    $('#wait_info>.well').text(location.host + '/othello/' + id);
    $('#wait_info>.qrcode').html('').qrcode({"width" : 300, "height" : 300, "text" : $('#wait_info>.well').text()});
};
Game.prototype.start = function(color) {
    //$('#newGameButton').hide();
    $('#joinGameButton').hide();
    $('#wait_info').hide();
    this.enable = true;
    this.drawGameBoard();
    var board = new Board(color);
    this.setBoard(board);
    this.showLeagleGirds();
};
Game.prototype.createMove = function(row, col) {
    this.connection.moveSend(this.board.board, this.board.turn, row, col);
};
Game.prototype.move = function(data) {
    if (!this.board.isSame(data.board, data.turn)) {
        //sync
    }
    this.enable = true;
    this.clearLeagleGirds();
    var row = data.row;
    var col = data.col;
    turnedGird = this.board.put(row, col);
    if (row !== -1 && col !== -1) {
        this.show(row, col, this.board.get(row, col));
        for (var i = 0; i < turnedGird.length; i++) {
            r = turnedGird[i][0];
            c = turnedGird[i][1];
            this.show(r, c, this.board.get(r, c));
        }
    }
    this.showLeagleGirds();
    if (this.game_status === game_status.pass && this.board.isMyTurn()) {
        $('#pass').modal('show');
    } else if(this.game_status === game_status.game_over) {
        var cmp = this.board.compare();
        if (cmp > 0) {
            $('#win').modal('show');
        } else if (cmp === 0) {
            $('#draw').modal('show');
        } else {
            $('#lose').modal('show');
        }
    }
};
Game.prototype.reconnect = function(data) {
    var info = data.info;
    var log = data.log;
    if (!info) return;
    //$('#newGameButton').hide();
    $('#joinGameButton').hide();
    $('#wait_info').hide();
    this.enable = true;
    this.drawGameBoard();
    var board = new Board(info.color);
    if (log && log.length) {
        for (var i = 0; i < log.length; i++) {
            var move = JSON.parse(log[i]);
            board.put(move[0], move[1]);
        }
    }
    this.setBoard(board);
    this.showLeagleGirds();
};
$(function(){
    //$('#newGameButton').hide();
    $('#joinGameButton').hide();
    $('#wait_info').hide();
    var game = new Game();
    var connection = new Connection();
    connection.connect(game);
    game.connection = connection;
    $('#pass').on('hide.bs.modal', function(e) {
        game.createMove(-1, -1);
    });
    var $newGame = $('#newGame');
    $newGame.find('.btn-primary').click(function() {
        var obj = getFormObj($newGame.find('form'));
        var nickname = obj.nickname;
        var color = obj.color;
        if (!nickname || nickname.length > 64) {
            alert('nickname is empty or too long.');
            return;
        }
        connection.newGameSend(color, nickname);
        //$('#newGameButton').hide();
        $newGame.modal('hide');
    });
    $('#newGameButton').click(function() {
        connection.newGame();
    });
    var $joinGame = $('#joinGame');
    $joinGame.find('.btn-primary').click(function() {
        var obj = getFormObj($joinGame.find('form'));
        var nickname = obj.nickname;
        if (!nickname || nickname.length > 64) {
            alert('nickname is empty or too long.');
            return;
        }
        connection.joinGameSend(nickname);
        $('#joinGameButton').hide();
        $joinGame.modal('hide');
    });
});
