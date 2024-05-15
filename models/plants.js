let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let plantSchema = new Schema({

    plantName: {
        type: String,
        required: true
    },
    dateTime: {
        type: Date,
    },
    plantSize: {
        type: String,
    },
    plantCharacteristics: {
        type: String,
    },
    plantPhoto: {
        type: String,
    },
    url: {
        type: String,
    },
    address: {
        type: String,
    },
    location: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }

});

plantSchema.set('toObject', { getters: true, virtuals: true });

let Plant = mongoose.model('Plant', plantSchema);

module.exports = Plant;