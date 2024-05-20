var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var plants = require('../controllers/plantsController');
var User = require('../models/user'); // Import the User model

var globals = require('./globals');

router.get('/:plantName', async function(req, res, next) {
  var plantName = decodeURIComponent(req.params.plantName);
  
  try {
    var plant = await plants.getPlant(plantName);
    if (!plant) {
      return res.status(404).send('Plant not found');
    }



    User.findOne({username: globals.currentUser})
      .then(user => {
          if (!user) {
              return res.redirect('/set-username');
          }
          res.render('plant-detail', { title: plant.plantName , plant: plant, user: user });
      })
      .catch(err => next(err));
  } catch (err) {
      console.error(err);
      res.status(500).send('Error occurred while fetching plant data');
      }
});

module.exports = router;