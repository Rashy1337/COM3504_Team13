const mongoose = require('mongoose');

const mongoDB = 'mongodb://localhost:27017/users';
let connection;

mongoose.Promise = global.Promise;

mongoose.connect(mongoDB).then(result => {
    connection = result;
    console.log('Connection Successful!');
}).catch(err => {
    console.log('Connection Failed!', err);
})