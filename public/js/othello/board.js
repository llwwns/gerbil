const directions = [-1, 1, 0, -1, 0, 1, 1, -1, -1];
const size = 8;
class Board {
    constructor(color) {
        console.log(`color = ${color}`);
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
    static getSize() {
        return size;
    }
    isMyTurn() {
        return this.turn === this.myColor;
    }
    check(row, col) {
        if (row === -1 && col === -1) {
            return true;
        }
        if (this.board[row][col] !== 0) {
            return false;
        }
        let checking = this.turn;
        let opp = 3 - this.turn;
        direct: for (let dir = 1; dir < directions.length; dir++) {
            let dr = directions[dir - 1];
            let dc = directions[dir];
            let r = row + dr;
            let c = col + dc;
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
    put(row, col) {
        let turnedGird = [];
        let checking = this.turn;
        let opp = 3 - this.turn;
        if (row === -1 && col === -1) {
            this.turn = 3 - this.turn;
            return turnedGird;
        }
        this.board[row][col] = checking;
        direct: for (let dir = 1; dir < directions.length; dir++) {
            let dr = directions[dir - 1];
            let dc = directions[dir];
            let r = row + dr;
            let c = col + dc;
            let clear = false;
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
    pass() {
        this.turn = 3 - this.turn;
    }
    getLegalGirds() {
        let legalGirds = [];
        for (let i = 0; i < size; i ++) {
            for (let j = 0; j < size; j ++) {
                if (this.check(i, j)) {
                    legalGirds.push([i, j]);
                }
            }
        }
        return legalGirds;
    }
    each(fun) {
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                fun(this.board[row][col], row, col);
            }
        }
    }
    get(row, col) {
        return this.board[row][col];
    }
    isSame(board, turn) {
        if (turn != this.turn) {
            return false;
        }
        for (let i = 0; i < size; i ++) {
            for (let j = 0; j < size; j ++) {
                if (board[i][j] != this.board[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }
    compare() {
        let mc = 0;
        let oc = 0;
        for (let i = 0; i < size; i ++) {
            for (let j = 0; j < size; j ++) {
                if (this.board[i][j] === this.myColor) {
                    mc++;
                } else if (this.board[i][j] !== 0) {
                    oc++;
                }
            }
        }
        return mc - oc;
    }
}

if (typeof exports !== 'undefined') {
    exports.Board = Board;
}
