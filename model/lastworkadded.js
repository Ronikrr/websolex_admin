const mongoose = require('mongoose')

const lastworkSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    business: { type: String, required: true },
    rate: { type: String, required: true },
    image: { type: String, required: true },
});

const Lastwork = mongoose.model('LastworkSchema', lastworkSchema);

module.exports = Lastwork