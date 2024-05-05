var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('finalplant', { title: 'Plant Findr!' });
});

module.exports = router;

/* GET upload page. */
router.get('/upload', function(req, res, next) {
    res.render('upload', { title: 'Upload Page' });
});

module.exports = router;

/* GET Plant page. */
router.get('/finalplant', function(req, res, next) {
    res.render('finalplant', { title: 'Plants' });
});

module.exports = router;

app.post('/upload', function(req, res) {
    // Access form data from the request body
    const plantName = req.body.plantName;
    const dateTime = req.body.dateTime;
    const plantSize = req.body.plantSize;
    // Access other form fields as needed

    // Process the form data
    // For example, you can save it to a database, perform validation, etc.

    // Pass the processed form data to the "finalplant.ejs" file
    res.render('finalplant', { plantName: plantName, dateTime: dateTime, plantSize: plantSize });
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
