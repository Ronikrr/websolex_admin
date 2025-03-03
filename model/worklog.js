const mongoose = require('mongoose');

const workLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.ObjectId, ref: 'Users', required: true },
    email: { type: String, ref: 'Users', required: true },  // Add email field
    date: { type: String, required: true },
    work: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('WorkLog', workLogSchema);
