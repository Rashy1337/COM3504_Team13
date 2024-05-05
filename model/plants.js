let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let PlantSchema = new Schema({

    plantName: {String, required: true, max: 100},
    dateTime: {Date},
    plantSize: {String, required: true, max: 100},
    plantCharacteristics: {String, required: true, max: 100},
    plantPhoto: {String}, // You might want to store the path or URL to the photo
    url: String,
    address: String
});

PlantSchema.set('toObject', {getters: true , virtuals: true });

let Plants = mongoose.model('plants', PlantSchema);

module.exports = Plants;