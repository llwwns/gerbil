var directions = [-1, 1, 0, -1, 0, 1, 1, -1, -1];
var size = 8;
function Board(color) {
    this.myColor = color;
    this.board = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 2, 0, 0, 0],
        [0, 0, 0, 2, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ];
    this.turn = 2;
    this.size = size;
}

Board.prototype.isMyTurn = function() {
    return this.turn === this.myColor;
}

Board.prototype.check = function(row, col) {
    if (row === -1 && col === -1) {
        return true;
    }
    if (this.board[row][col] !== 0) {
        return false;
    }
    var checking = this.turn;
    var opp = 3 - this.turn;
    direct: for (var dir = 1; dir < directions.length; dir++) {
        var dr = directions[dir - 1];
        var dc = directions[dir];
        var r = row + dr;
        var c = col + dc;
        if (r < 0 || c < 0 || r >= size || c >= size || this.board[r][c] != opp) {
            continue;
        }
        r += dr;
        c += dc;
        while (r >= 0 && c >= 0 && r < size && c < size) {
            if (this.board[r][c] === checking) {
                return true;
            } else if (this.board[r][c] === 0) {
                continue direct;
            }
            r += dr;
            c += dc;
        }
    }
    return false;
}

Board.prototype.put = function(row, col) {
    var turnedGird = [];
    var checking = this.turn;
    var opp = 3 - this.turn;
    if (row === -1 && col === -1) {
        this.turn = 3 - this.turn;
        return turnedGird;
    }
    this.board[row][col] = checking;
    direct: for (var dir = 1; dir < directions.length; dir++) {
        var dr = directions[dir - 1];
        var dc = directions[dir];
        var r = row + dr;
        var c = col + dc;
        var clear = false;
        if (r < 0 || c < 0 || r >= size || c >= size || this.board[r][c] != opp) {
            continue;
        }
        r += dr;
        c += dc;
        while (r >= 0 && c >= 0 && r < size && c < size) {
            if (this.board[r][c] === checking) {
                clear = true;
                break;
            } else if (this.board[r][c] === 0) {
                continue direct;
            }
            r += dr;
            c += dc;
        }
        if (clear) {
            r -= dr;
            c -= dc;
            do {
                this.board[r][c] = checking;
                turnedGird.push([r, c]);
                r -= dr;
                c -= dc;
            } while (r != row || c != col);
        }
    }
    this.turn = 3 - this.turn;
    return turnedGird;
}

Board.prototype.pass = function() {
    this.turn = 3 - this.turn;
}

Board.prototype.getLegalGirds = function() {
    var legalGirds = [];
    for (var i = 0; i < size; i ++) {
        for (var j = 0; j < size; j ++) {
            if (this.check(i, j)) {
                legalGirds.push([i, j]);
            }
        }
    }
    return legalGirds;
}

Board.prototype.each = function(fun) {
    for (var row = 0; row < size; row ++) {
        for (var col = 0; col < size; col ++) {
            fun(this.board[row][col], row, col);
        }
    }
}

Board.prototype.get = function(row, col) {
    return this.board[row][col];
}

Board.prototype.isSame = function(board, turn) {
    if (turn != this.turn) {
        return false;
    }
    for (var i = 0; i < size; i ++) {
        for (var j = 0; j < size; j ++) {
            if (board[i][j] != this.board[i][j]) {
                return false;
            }
        }
    }
    return true;
}

if (typeof exports !== 'undefined') {
    exports.Board = Board;
}

Board.prototype.compare = function() {
    var mc = 0;
    var oc = 0;
    for (var i = 0; i < size; i ++) {
        for (var j = 0; j < size; j ++) {
            if (this.board[i][j] === this.myColor) {
                mc++;
            } else if (this.board[i][j] !== 0) {
                oc++;
            }
        }
    }
    return mc - oc;
}
