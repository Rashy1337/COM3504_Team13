var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

/* GET upload page. */
router.get('/upload', function(req, res, next) {
  res.render('upload', { title: 'Upload Page' });
});

module.exports = router;

/* GET Plant page. */
router.get('/finalplant', function(req, res, next) {
  res.render('finalplant', { title: 'Final Plant' });
});

module.exports = router;