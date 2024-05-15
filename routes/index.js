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
router.get('/', function(req, res, next) {
  console.log('Sort value in routes:', req.query.sort);
  let result = plants.getAll(req.query.sort);
  result.then(data => {
    let parsedData = JSON.parse(data);
    res.render('index', { title: 'Plant Findr!', plants: parsedData });
  });
});

/* GET upload page. */
router.get('/upload', function(req, res, next) {
    res.render('upload', { title: 'Upload Page' });
});

router.post('/upload', upload.single('plantPhoto'), async function(req, res, next) {
    let plantsData = req.body;
    let filePath = req.file.path;
    filePath = filePath.replace('public', ''); // Convert local file path to URL path
    plantsData.plantPhoto = filePath;

    let locationData = JSON.parse(req.body.location); // Parse location data
    plantsData.location = {
        type: 'Point',
        coordinates: [locationData.lng, locationData.lat] // Use lng and lat values to create coordinates array
    };

    try {
        let results = await plants.create(plantsData, filePath); // Wait for the promise to resolve
        console.log(results);
    } catch (error) {
        console.error(error);
        // Handle error here, for example, render an error page
    }
    res.redirect('/');
});

module.exports = router;