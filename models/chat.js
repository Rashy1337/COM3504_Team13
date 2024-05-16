const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    plantID: String,
    message: String,
    timestamp: Date
});

module.exports = mongoose.model('Chat', chatSchema);
