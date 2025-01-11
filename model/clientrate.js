const mongoose = require('mongoose')

const clientrateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    business: { type: String, required: true },
    rate: { type: String, required: true },
    image: { type: String }, // Store the image file path
});

const clientrate = mongoose.model('Clientrate', clientrateSchema);

module.exports = clientrate