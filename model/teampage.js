const mongoose = require('mongoose')

const teampageSchema = new mongoose.Schema({
    name: { type: String },
    post: { type: String },
    image: { type: String }, // Store the image file path
    linkedin: { type: String },
    insta: { type: String },
    facebook: { type: String },
});

const teampage = mongoose.model('Teampage', teampageSchema);
module.exports = teampage