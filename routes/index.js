var express = require('express');
var router = express.Router();
var students = require('../controllers/students'); // make sure the path is correct

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/add', function(req, res) {
  let userData = req.body;
  let result = students.create(userData);
  console.log(result);
  res.redirect('/');
});

module.exports = router;