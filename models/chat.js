const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    plantID: String,
    username: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
