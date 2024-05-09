let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let plantSchema = new Schema({

    plantName: { type: String, required: true },
    dateTime: { type: Date},
    plantSize: { type: Number },
    plantCharacteristics: { type: String},
    plantPhoto: { type: String},
    url: { type: String},
    address: { type: String }

});

plantSchema.set('toObject', { getters: true, virtuals: true });

let Plant = mongoose.model('Plant', plantSchema);

module.exports = Plant;