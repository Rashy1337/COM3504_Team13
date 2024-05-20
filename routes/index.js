const express = require('express');
const router = express.Router();
const multer = require('multer');
const plants = require('../controllers/plantsController');
const Chat = require('../models/chat');
const Plants = require('../models/plants');
const User = require('../models/user');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/uploads/');
    },
    filename: function (req, file, cb) {
        const original = file.originalname;
        const file_extension = original.split(".");
        const filename = Date.now() + '.' + file_extension[file_extension.length - 1];
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
                // Retrieve all plants from the database
                const sort = req.query.sort; // Get sort parameter from request query
                plants.getAll(sort, user.username) // Use getAll function from controller
                    .then(plants => {
                        // Pass the user and plants objects to the view
                        res.render('index', { title: 'Home', user: user, plants: plants });
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
    console.log(req.file); // Log the file object if uploaded
    let plantsData = req.body;
    let filePath;

    if (req.file) {
        filePath = req.file.path.replace('public', ''); // Convert local file path to URL path if file is uploaded
    } else if (req.body.photoUrl) {
        filePath = req.body.photoUrl; // Use the URL provided in the form if no file is uploaded
    } else {
        // Handle case where neither a file is uploaded nor a URL is provided
        return res.status(400).send('No image provided');
    }
    plantsData.plantPhoto = filePath;

    let locationData;
    try {
        locationData = JSON.parse(req.body.location); // Parse location data
    } catch (err) {
        console.error('Error parsing location data:', err);
        locationData = null;
    }

    if (locationData) {
        plantsData.location = {
            type: 'Point',
            coordinates: [locationData.lng, locationData.lat] // Use lng and lat values to create coordinates array
        };
    } else {
        plantsData.location = {
            type: 'Point',
            coordinates: [0, 0] // Default coordinates in case of missing location data
        };
    }

    try {
        let results = await plants.create(plantsData, filePath, req.body.username); // Wait for the promise to resolve
        console.log(results);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error occurred while uploading plant data');
    }
});

router.get('/plants', async (req, res) => {
    try {
        const plants = await Plants.find({});
        res.json(plants);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/sync-chat', async (req, res) => {
    try {
        const chatMessage = new Chat(req.body);
        await chatMessage.save();
        res.status(200).send('Chat message synced successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error syncing chat message');
    }
});

module.exports = router;
