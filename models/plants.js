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
        hasFlower: Boolean,
        hasSeed: Boolean,
        isFruit: Boolean,
    },
    plantIdentification: {
        type: String,
    },
    sunExposure: {
        type: String,
    },
    descriptions: {
        type: String,
    },
    colour: {
        type: String,
    },
    plantPhoto: {
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
    },
    username: {
        type: String,
        required: true

    }

});

// Add the 2dsphere index to the location field
plantSchema.index({ location: '2dsphere' });

plantSchema.set('toObject', { getters: true, virtuals: true });

let Plant = mongoose.model('Plant', plantSchema);

module.exports = Plant;