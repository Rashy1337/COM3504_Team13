const plantsModel = require('../models/plants');

exports.create = function(plantsData, filePath) {
    let plant = new plantsModel({
        plantName: plantsData.plantName,
        dateTime: plantsData.dateTime,
        plantSize: plantsData.plantSize,
        plantCharacteristics: plantsData.plantCharacteristics,
        plantPhoto: filePath, // Use filePath from arguments
        url: plantsData.url,
        address: plantsData.address
    });

    return plant.save().then(plant => {
        console.log(plant);

        return JSON.stringify(plant);
    }).catch((err) => {
        console.log(err);
        return null;
    });
};

exports.getAll = function() {
    return plantsModel.find({}).then(plants => {
        return JSON.stringify(plants);
    }).catch(err => {
        console.log(err);
        return null;
    });
};

exports.getPlant = function(plantName) {
    return plantsModel.findOne({ plantName: plantName }).then(plant => {
        return plant;
    }).catch(err => {
        console.log(err);
        return null;
    });
}
