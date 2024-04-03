let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let StudentSchema = new Schema (
    {

        first_name: {type: String, required: true, max: 100},

        last_name: {type: String, required: true, max: 100},

        dob: {type: Date },
    }
);
StudentSchema.set('toObject', {getters: true, virtuals: true });

let Student = mongoose.model('Student', StudentSchema);
module.exports = Student;