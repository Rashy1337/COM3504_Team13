// Require mongoose package
let mongoose = require('mongoose');

// Get the Schema constructor from mongoose
let Schema = mongoose.Schema;

// Define the schema for plant data
let plantSchema = new Schema({
    // Name of the plant, required field
    plantName: {
        type: String,
        required: true
    },
    // Date and time of plant data entry
    dateTime: {
        type: Date,
    },
    // Size of the plant
    plantSize: {
        type: String,
    },
    // Characteristics of the plant (e.g., whether it has flower, seed, or fruit)
    plantCharacteristics: {
        hasFlower: Boolean,
        hasSeed: Boolean,
        isFruit: Boolean,
    },
    // Identification information about the plant
    plantIdentification: {
        type: String,
    },
    // Sun exposure requirements for the plant
    sunExposure: {
        type: String,
    },
    // Descriptions of the plant
    descriptions: {
        type: String,
    },
    // Color of the plant
    colour: {
        type: String,
    },
    // Base64 string representation of the plant photo
    plantPhoto: {
        type: String, // Changed from file path to Base64 string
    },
    // Address where the plant is located
    address: {
        type: String,
    },
    // Location of the plant using GeoJSON format
    location: {
        type: {
            type: String, // Specify the type of GeoJSON object
            enum: ['Point'], // Must be 'Point' for GeoJSON
            required: true
        },
        coordinates: {
            type: [Number], // Array of numbers [longitude, latitude]
            required: true
        }
    },
    // Username of the user who added the plant data, required field
    username: {
        type: String,
        required: true
    }
});

// Add a 2dsphere index to the location field for geospatial queries
plantSchema.index({ location: '2dsphere' });

// Set options for converting schema objects to JSON
plantSchema.set('toObject', { getters: true, virtuals: true });

// Create a mongoose model 'Plant' based on the defined schema
let Plant = mongoose.model('Plant', plantSchema);

// Export the Plant model
module.exports = Plant;
