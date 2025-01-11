const mongoose = require('mongoose')

const socialSchema = new mongoose.Schema({
    facebook: { type: String },
    whatsapp: { type: String },
    instagram: { type: String },
    linkedin: { type: String },
});

const socialdetails = mongoose.model('socialdetails', socialSchema);

module.exports = socialdetails