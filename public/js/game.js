colors = {
    white: 1,
    black: 2,
}
var showCell = function(bk, $e) {
    $e.css('background', bk).css('transform', 'rotateY(90deg)').transition({
        rotateY: '0'
    }, 300);
}
function Game() {
    $('#game-board').html('');
}
var size = 8;
Game.prototype.drawGameBoard = function() {
    html = '<table><tr><th></th>';
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
    html += '</table>';
    $('#game-board').html(html);
    var game = this;
    $('.cell').click(function() {
        var row = parseInt($(this).attr('row'));
        var col = parseInt($(this).attr('col'));
        if (game.board.check(row, col)) {
            turnedGird = game.board.put(row, col);
            console.log(JSON.stringify(turnedGird));
            game.show(row, col, game.board.get(row, col));
            for (var i = 0; i < turnedGird.length; i++) {
                r = turnedGird[i][0];
                c = turnedGird[i][1];
                game.show(r, c, game.board.get(r, c));
            }
        }
    });
}
Game.prototype.show = function(row, col, clr) {
    var bk = (clr == colors.black) ? '#000' : '#fff'; 
    showCell(bk, $('td[row=' + row + '][col=' + col + ']>div'));
}
Game.prototype.setBoard = function(board) {
    this.board = board;
    var show = this.show;
    board.each(function(val, row, col) {
        if (val > 0) {
            show(row, col, val);
        }
    });
}
$(function(){
    var game = new Game();
    game.drawGameBoard();
    var board = new Board('black');
    game.setBoard(board);
    //$('#pass').modal('show');
});
