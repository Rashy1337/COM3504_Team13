const express = require('express');
const router = express.Router();
const multer = require('multer');
const plants = require('../controllers/plantsController');
const Chat = require('../models/chat');
const axios = require('axios');
const Plants = require('../models/plants');
const User = require('../models/user');

var globals = require('./globals');

const storage = multer.memoryStorage();
let upload = multer({ storage: storage });

/* GET home page. */
router.get('/', function(req, res, next) {
    User.findOne({username: globals.currentUser}) // Retrieve the first user from the database
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
    User.findOne({ username: req.body.username })
        .then(existingUser => {
            if (existingUser) {
                existingUser.location = {
                    type: 'Point',
                    coordinates: [location.lng, location.lat]
                };
                return existingUser.save();
            } else {
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
            console.log('User saved successfully'); // Log success message
            globals.currentUser = req.body.username;
            res.redirect('/');
        })
        .catch(err => {
            console.log('Error saving user:', err); // Log error message
            next(err);
        });
});

router.post('/change-username', function(req, res, next) {
    User.findOneAndUpdate({username: globals.currentUser}, { username: req.body.newUsername }) // Update the first user in the database
        .then(() => {
            globals.currentUser = req.body.newUsername; // Update the current username
            res.redirect('/');
        })
        .catch(err => next(err));
});

/* GET upload page. */
router.get('/upload', function(req, res, next) {
    User.findOne({username: globals.currentUser})
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
    let plantsData = req.body;
    let fileBuffer;

    if (req.file) {
        fileBuffer = req.file.buffer; // Get file buffer if file is uploaded
    } else if (req.body.photoUrl) {
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

    const base64Image = fileBuffer.toString('base64');
    plantsData.plantPhoto = base64Image;

    let locationData;
    try {
        locationData = JSON.parse(req.body.location);
    } catch (err) {
        console.error('Error parsing location data:', err);
        locationData = null;
    }

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
