var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var plants = require('../controllers/plantsController');
var Plants = require('../models/plants');
var User = require('../models/user');
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
    User.findOne({}) // Retrieve the first user from the database
        .then(user => {
            if (!user) {
                // If the user hasn't been set, redirect to the set-username page
                res.redirect('/set-username');
            } else {
                // Retrieve all plants from the database with sorting
                // console.log('Sort value in routes:', req.query.sort);
                let result = plants.getAll(req.query.sort, user.username);
                result.then(plants => {
                    // Pass the user and plants objects to the view
                    res.render('index', { title: 'Plant Findr!', user: user, plants: plants });
                })
                .catch(err => next(err));
            }
        })
        .catch(err => next(err));
});

router.get('/set-username', function(req, res, next) {
    res.render('set-username', { title: 'Set Username' });
});

router.post('/set-username', function(req, res, next) {
    console.log(req.body); // Log the body of the request
    let location = JSON.parse(req.body.location);
    let user = new User({
        username: req.body.username,
        location: {
            type: 'Point',
            coordinates: [location.lng, location.lat]
        }
    });
    user.save()
        .then(() => {
            console.log('User saved successfully'); // Log success message
            res.redirect('/')
        })
        .catch(err => {
            console.log('Error saving user:', err); // Log error message
            next(err);
        });
});

router.post('/change-username', function(req, res, next) {
    User.findOneAndUpdate({}, { username: req.body.newUsername }) // Update the first user in the database
        .then(() => {
            res.redirect('/');
        })
        .catch(err => next(err));
});

/* GET upload page. */
router.get('/upload', function(req, res, next) {
    User.findOne({}) // Retrieve the first user from the database
        .then(user => {
            if (!user) {
                // If the username hasn't been set, redirect to the set-username page
                res.redirect('/set-username');
            } else {
                res.render('upload', { title: 'Upload Page', user: user });
            }
        })
        .catch(err => next(err));
});

router.post('/upload', upload.single('plantPhoto'), async function(req, res, next) {
    console.log(req.body); // Log the body of the request
    console.log(req.file); // Log the file object
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
        let results = await plants.create(plantsData, filePath, req.body.username); // Wait for the promise to resolve
        console.log(results);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        // Handle error here, for example, render an error page
        res.status(500).send('Error occurred while uploading plant data');
    }
});

module.exports = router;

console.log('Service Worker Called...');
self.addEventListener('install', (event) => {
    console.log('[Service Worker] : Installed');
    event.waitUntil(caches.open('core').then((cache) => {
        cache.add(new Request('cached.html')).then(() => {
            console.log('[Service Worker] : Cached cached.html')
        });
    }));
});