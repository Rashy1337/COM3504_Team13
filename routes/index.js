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
let upload = multer({ storage: storage });

/* GET home page. */
/* GET home page. */
router.get('/', function(req, res, next) {
    let result = plants.getAll();
    result.then(plants => {
        let data = JSON.parse(plants);
        console.log(data.length);
        res.render('index', { title: 'Plant Findr!', plants: data }); // Changed 'plants' to 'data'
    });
});

/* GET upload page. */
router.get('/upload', function(req, res, next) {
    res.render('upload', { title: 'Upload Page' });
});

router.post('/upload', upload.single('plantPhoto'), function(req, res, next) {
    let plantsData = req.body;
    let filePath = req.file.path;
    filePath = filePath.replace('public', ''); // Convert local file path to URL path
    plantsData.plantPhoto = filePath;
    let results = plants.create(plantsData, filePath); // Pass filePath to create function
    console.log(results);
    res.redirect('/');
});

module.exports = router;