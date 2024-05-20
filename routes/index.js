// Import necessary modules
const express = require('express');
const router = express.Router();
const multer = require('multer');
const plants = require('../controllers/plantsController');
const Chat = require('../models/chat');
const axios = require('axios');
const Plants = require('../models/plants');
const User = require('../models/user');
var globals = require('./globals');

// Set up multer storage for file upload
const storage = multer.memoryStorage();
let upload = multer({ storage: storage });

// GET route for the home page
router.get('/', function(req, res, next) {
    // Retrieve the current user from the database
    User.findOne({username: globals.currentUser})
        .then(user => {
            if (!user) {
                // If the user hasn't been set, redirect to the set-username page
                res.redirect('/set-username');
            } else {
                // Retrieve all plants from the database and render the home page
                const sort = req.query.sort; // Get sort parameter from request query
                plants.getAll(sort, user.username)
                    .then(plants => {
                        res.render('index', { title: 'Home', user: user, plants: plants });
                    })
                    .catch(err => next(err));
            }
        })
        .catch(err => next(err));
});

// GET route for the set-username page
router.get('/set-username', function(req, res, next) {
    res.render('set-username', { title: 'Set Username' });
});

// POST route for setting the username
router.post('/set-username', function(req, res, next) {
    // Save the username to the database
    let location = JSON.parse(req.body.location);
    User.findOne({ username: req.body.username })
        .then(existingUser => {
            if (existingUser) {
                // Update existing user's location
                existingUser.location = {
                    type: 'Point',
                    coordinates: [location.lng, location.lat]
                };
                return existingUser.save();
            } else {
                // Create a new user with the provided username and location
                let user = new User({
                    username: req.body.username,
                    location: {
                        type: 'Point',
                        coordinates: [location.lng, location.lat]
                    }
                });
                return user.save();
            }
        })
        .then(() => {
            globals.currentUser = req.body.username;
            res.redirect('/');
        })
        .catch(err => {
            console.error('Error saving user:', err);
            next(err);
        });
});

// POST route for changing the username
router.post('/change-username', function(req, res, next) {
    // Update the username in the database
    User.findOneAndUpdate({username: globals.currentUser}, { username: req.body.newUsername })
        .then(() => {
            globals.currentUser = req.body.newUsername;
            res.redirect('/');
        })
        .catch(err => next(err));
});

// GET route for the upload page
router.get('/upload', function(req, res, next) {
    // Render the upload page
    User.findOne({username: globals.currentUser})
        .then(user => {
            if (!user) {
                res.redirect('/set-username');
            } else {
                res.render('upload', { title: 'Upload Page', user: user });
            }
        })
        .catch(err => next(err));
});

// POST route for uploading plant data
router.post('/upload', upload.single('plantPhoto'), async function(req, res, next) {
    // Handle plant data upload
    let plantsData = req.body;
    let fileBuffer;

    if (req.file) {
        fileBuffer = req.file.buffer; // Get file buffer if file is uploaded
    } else if (req.body.photoUrl) {
        // Download image from URL if provided
        try {
            const response = await axios.get(req.body.photoUrl, { responseType: 'arraybuffer' });
            fileBuffer = Buffer.from(response.data, 'binary');
        } catch (error) {
            console.error('Error downloading image from URL:', error);
            return res.status(400).send('Invalid image URL');
        }
    } else {
        return res.status(400).send('No image provided');
    }

    // Convert image to base64
    const base64Image = fileBuffer.toString('base64');
    plantsData.plantPhoto = base64Image;

    // Parse location data
    let locationData;
    try {
        locationData = JSON.parse(req.body.location);
    } catch (err) {
        console.error('Error parsing location data:', err);
        locationData = null;
    }

    // Save plant data to the database
    if (locationData) {
        plantsData.location = {
            type: 'Point',
            coordinates: [locationData.lng, locationData.lat]
        };
    } else {
        plantsData.location = {
            type: 'Point',
            coordinates: [0, 0]
        };
    }

    try {
        let results = await plants.create(plantsData, base64Image, req.body.username);
        console.log(results);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error occurred while uploading plant data');
    }
});

// GET route for fetching all plants
router.get('/plants', async (req, res) => {
    try {
        const plants = await Plants.find({});
        res.json(plants);
    } catch (err) {
        res.status(500).send(err);
    }
});

// POST route for syncing chat messages
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
