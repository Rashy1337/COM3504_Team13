var express = require('express');
var router = express.Router();

/* GET upload page. */
router.get('/', function (req, res, next) {
    res.render('upload', {title: 'Upload Page'});
});

// Add routes for handling file uploads, if needed

module.exports = router;

// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');

// Create Express application
const app = express();

// Use body-parser middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/upload', function(req, res) {
    // Access form data from the request body
    const plantName = req.body.plantName;
    const dateTime = req.body.dateTime;
    const plantSize = req.body.plantSize;
    // Access other form fields as needed

    // Process the form data
    // For example, you can save it to a database, perform validation, etc.

    // Send response back to the client
    res.send('Form data received and processed successfully!');
});

app.post('/upload', function(req, res) {
    // Access form data from the request body
    const plantName = req.body.plantName;
    const dateTime = req.body.dateTime;
    const plantSize = req.body.plantSize;
    // Access other form fields as needed

    // Process the form data
    // For example, you can save it to a database, perform validation, etc.

    // Redirect the user to the "finalplant" page
    res.redirect('/finalplant');
});