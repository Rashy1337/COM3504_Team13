var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

// Assuming your JSON data is not too large to be read synchronously on app startup
var plantsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/plants.json'), 'utf8'));

router.get('/:plantName', function(req, res, next) {
  var plantName = decodeURIComponent(req.params.plantName);
  var plant = plantsData.find(p => p.name === plantName);
  if (!plant) {
    return res.status(404).send('Plant not found');
  }
  res.render('plant-detail', { plant: plant });
});

module.exports = router;