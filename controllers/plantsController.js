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

exports.getAll = function(sort) {
    console.log('Sort value in controller:', sort);
    let sortOptions = {};
    switch (sort) {
        case 'name-asc':
            sortOptions.plantName = 1;
            break;
        case 'name-desc':
            sortOptions.plantName = -1;
            break;
        case 'date':
            sortOptions.dateTime = 1;
            break;
        case 'location':
            sortOptions.address = 1;
            break;
    }
    return plantsModel.find({}).sort(sortOptions).then(plants => {
        console.log(plants);
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
