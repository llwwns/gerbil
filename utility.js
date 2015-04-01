var crypto = require('crypto');
var seed = Math.floor(Math.random() * 1000);
var chars = "mXwGBMSgNYobeIjk8ZdOpf1yC9q0csP3xlLn7A5UD6uFiWvJTV2HhEztKaRr4Q";
exports.generate_room_number = function() {
    var time = Math.floor(Date.now()) - 1428000000000;
    var num = time + seed * 500000000000;
    var output = "";
    while(num > 0) {
        output += chars.charAt(num % chars.length);
        num = Math.floor(num / chars.length);
    }
    var md5sum = crypto.createHash('md5'); 
    md5sum.update(output, 'ascii'); 
    output = md5sum.digest('base64') 
    output = output.replace(/\+/g, '-');
    output = output.replace(/\//g, '_');
    return output;
}
