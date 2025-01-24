const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    name: { type: String, required: true },
    content: [{
        title: { type: String, required: true },
        subtitle: { type: String, required: true },
        description: { type: String, required: true }
    }],
    image: { type: String },
    submittedAt: { type: Date, default: () => new Date() },
});

const blog = mongoose.model('Blogpage', blogSchema);
module.exports = blog;
