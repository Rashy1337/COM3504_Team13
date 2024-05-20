// Require mongoose package
let mongoose = require('mongoose');

// Get the Schema constructor from mongoose
let Schema = mongoose.Schema;

// Define the schema for user data
let userSchema = new Schema({
    // Username of the user, required field
    username: {
        type: String,
        required: true
    },
    // Location of the user using GeoJSON format
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
    }
});

// Create a mongoose model 'User' based on the defined schema
let User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;
