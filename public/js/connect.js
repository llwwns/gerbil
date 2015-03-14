$(function(){
    var socket = io(location.host + '/othello');
    socket.on('id', function(data) {
        var id = $.cookie('othello#id');
        if (!id) {
            id = data;
            $.cookie('othello#id', id);
        }
        socket.emit('info', id);
    });

    socket.on('room', function(data) {
    });
});
