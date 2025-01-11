const mongoose = require('mongoose')

const contactformSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    contactnumber: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true }
});
const ContactForm = mongoose.model('ContactForm', contactformSchema);

module.exports = ContactForm