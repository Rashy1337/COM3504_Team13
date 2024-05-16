var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var plants = require('../controllers/plantsController');
var User = require('../models/user'); // Import the User model

router.get('/:plantName', async function(req, res, next) {
  var plantName = decodeURIComponent(req.params.plantName);
  
  try {
    var plant = await plants.getPlant(plantName);
    if (!plant) {
      return res.status(404).send('Plant not found');
    }

    // Fetch the user object from the database
    var user = await User.findOne({});

    // Check if the user object exists
    if (!user) {
      // If the user object doesn't exist, redirect to the set-username page
      return res.redirect('/set-username');
    }

    // Render the plant-detail view and pass the plant and user objects to it
    res.render('plant-detail', { title: plant.plantName , plant: plant, user: user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error occurred while fetching plant data');
  }
});

module.exports = router;