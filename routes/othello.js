var express = require('express');
var router = express.Router();
var settings = require('../settings');

/* GET users listing. */
router.get('/', function(req, res, next) {
    global.client.set("string key", "string val", global.redis.print);
    //console.log(JSON.stringify(settings));
    res.render('othello', {
        title: 'Othello',
        navigations: settings.navigations
    });
});

module.exports = router;
