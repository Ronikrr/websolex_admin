const mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    title: { type: String, required: true },
    dis1: { type: String, required: true },
    dis2: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String },
});

const service = mongoose.model('Servicepage', serviceSchema);

module.exports = service