var directions = [-1, 1, 0, -1, 0, 1, 1, -1, -1];
var size = 8;
function Board(color) {
    this.myColor = color === 'black' ? 2 : 1;
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

Board.prototype.check = function(row, col) {
    if (this.board[row][col] !== 0) {
        return false;
    }
    var checking = this.turn;
    var opp = 3 - this.turn;
    for (var dir = 1; dir < directions.length; dir++) {
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
    this.board[row][col] = checking;
    for (var dir = 1; dir < directions.length; dir++) {
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
