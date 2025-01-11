const mongoose = require('mongoose')


const employeeSchema = mongoose.Schema({
    name: { type: String, required: true },
    designation: { type: String, required: true },
    department: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    salary: { type: Number, required: true },
    join_date: { type: Date, required: true },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Probation', 'Resigned', 'Terminated', 'Retired', 'On Leave', 'Deceased'],
        default: 'Active'
    },
})
const employee = mongoose.model('employeedetails', employeeSchema);






module.exports = employee