const mongoose = require('mongoose')


const contactdetailsSchema = new mongoose.Schema({
    address: { type: String, required: true },
    phoneno: { type: String },
    avaliablity: { type: String, required: true },
    email: { type: String, required: true },
});

const contactdetails = mongoose.model('Contactdetails', contactdetailsSchema);

module.exports = contactdetails