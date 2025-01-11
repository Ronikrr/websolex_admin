const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    name: { type: String, required: true },
    title1: { type: String, required: true },
    description1: { type: String, required: true },
    title2: { type: String, required: true },
    description2: { type: String, required: true },
    title3: { type: String, required: true },
    description3: { type: String, required: true },
    image: { type: String },
});

const blog = mongoose.model('Blogpage', blogSchema);
module.exports = blog