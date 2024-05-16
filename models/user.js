let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
});

let User = mongoose.model('User', userSchema);

module.exports = User;