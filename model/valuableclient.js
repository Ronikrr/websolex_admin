const mongoose = require("mongoose")

const valueclientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String },
});

const Valueclient = mongoose.model('Valueableclients', valueclientSchema);

module.exports = Valueclient