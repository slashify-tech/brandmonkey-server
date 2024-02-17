const mongoose = require('mongoose');

const employeeSchema = mongoose.Schema({
    team : {
        type : String,
        required : true
    },
    employeeId : {
        type : String,
        required : true
    },
    name : {
        type : String,
        required : true
    },
    designation : {
        type : String,
        required : true
    },
    phoneNumber : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    type :{
        type : String,
        required : true
    },
    services : {
        type : String,
        required : true
    }
});

const Employees = mongoose.model('employees', employeeSchema);
module.exports = Employees;