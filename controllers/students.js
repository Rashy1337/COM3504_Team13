const studentmodel = require('../models/students');

exports.create = function (userData) {
    let student = new studentmodel({
        first_name: userData.first_name,
        last_name: userData.last_name,
        dob: userData.dob,
    });
    return student.save().then(student => {
        console.log(student);
        return JSON.stringify(student);
    }).catch(err => {
        console.log(err);
        return null;
    });
};