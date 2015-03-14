var async = require('async');

/*var new_room = function(socket, id) {
    socket.join(room_id);
    global.client.hset('user_room', id, room_id, function(){});
    global.client.hset('room_user', room_id, JSON.stringify([id]), function(){});
    room_id++;
}*/

var connect_room = function(socket, id, room) {
    global.client.hget('room_user', room, function(err, users) {
        var user_arr = [id];
        if (users) {
            user_arr = JSON.parse(users);
            if (user_arr.isArray()) {
                var in_room = false;
                for (var i = 0; i < user_arr; i++) {
                    if (user_arr == id) {
                        in_room = true;
                        break;
                    }
                }
                if (!in_room) {
                    if (user_arr.length >= 2) {
                        socket.emit('error', 'room is full');
                        return;
                    }
                }
                usr_arr.push(id);
            } else {
                user_arr = [id];
            }
        }
        global.client.hset('room_user', room, JSON.stringify(user_arr), function(err, val) {});
    });
    socket.join(room);
    socket.emit('room_joined', count);
}

exports.connect = function(nsp) {
    nsp.on('connection', function(socket) {
        console.log('#' + socket.id + ' connect');
        socket.emit('id', socket.id);
        socket.on('disconnect', function() {
            console.log('#' + socket.id + ' disconnect');
            global.client.hget('ids', socket.id, function(err, id) {
                if (id) {
                    global.client.hdel('user_room', socket.id, function(){});
                }
                global.client.hdel('ids', socket.id, function(){});
            });
        });
        socket.on('info', function(data) {
            console.log('recieve info #' + JSON.stringify(data) + '#');
            if (!data || !typeof(data) === 'string' || data.length > 128) {
                socket.emit('_error', 'info is empty');
                return;
            }
            global.client.hset('ids', socket.id, data, function(err, val) {
                if (err) {
                    socket.emit('error');
                } else {
                    console.log('id set #' + socket.id + 'to #' + data);
                    socket.emit('room', '');
                }
            });
        });
        socket.on('room', function(data) {
            if (!data) {
                socket.emit('error');
                return;
            }
            if (data === 'random') {
                random_room(socket, id);
            } else if(data === 'new') {
                global.client.hget('ids', socket.id,  function(err, id) {
                    if (err) {
                        socket.emit('error');
                    } else {
                        new_room(socket, id);
                    }
                });
            } else {
                if (typeof(data) === 'string' || data.length <= 128) {
                    global.client.hget('ids', socket.id,  function(err, id) {
                        if (!err && id) {
                            global.client.hget('user_room', id,  function(err, room) {
                                if (room == data) {
                                    connect_room(socket, id, room);
                                    return;
                                } else if (!room) {
                                    new_room(socket, id);
                                    return;
                                }
                            });
                        }
                    });
                }
                socket.emit('error');
            }
        });
    });
};
