const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    message: String,
    timestamp: Date
});

module.exports = mongoose.model('Chat', chatSchema);
