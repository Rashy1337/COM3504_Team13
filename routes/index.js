var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var plants = require('../controllers/plantsController');
var Plants = require('../models/plants');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/uploads/');
    },
    filename: function (req, file, cb) {
        var original = file.originalname;
        var file_extension = original.split(".");
        filename =  Date.now() + '.' + file_extension[file_extension.length-1];
        cb(null, filename);
    }
    });
    var upload = multer({ storage: storage });

/* GET home page. */
router.get('/', function(req, res, next) {
  var plantsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/plants.json'), 'utf8'));
  res.render('index', { title: 'Plant Findr!', plants: plantsData });
});

/* GET upload page. */
router.get('/upload', function(req, res, next) {
  res.render('upload', { title: 'Upload Page' });
});
router.post('/upload', upload.single('plantPhoto'), function(req, res, next) {
    let plantsData = req.body;
    let filePath = req.file.path;
    let results = plants.create(plantsData);
    console.log(results);
    res.redirect('/')
});

module.exports = router;