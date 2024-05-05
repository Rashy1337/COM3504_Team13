var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  var plantsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/plants.json'), 'utf8'));
  res.render('index', { title: 'Plant Findr!', plants: plantsData });
});

module.exports = router;