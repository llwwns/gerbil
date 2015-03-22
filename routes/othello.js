var express = require('express');
var router = express.Router();
var settings = require('../settings');

router.get('/', function(req, res, next) {
    res.render('othello', {
        title: 'Othello',
        navigations: settings.navigations
    });
});

router.get('/:id', function(req, res, next) {
    res.render('othello', {
        title: 'Othello',
        navigations: settings.navigations,
        id: req.params.id
    });
});

module.exports = router;
