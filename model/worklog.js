const mongoose = require('mongoose');

const workLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.ObjectId, ref: 'Users', required: true },
    email: { type: String, ref: 'Users', required: true },
    date: { type: String, required: true },
    projectName: { type: String, required: true },  // Added project name
    work: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    totalHours: { type: String, required: true }
});

const worklog = mongoose.model('WorkLog', workLogSchema);
module.exports = worklog
