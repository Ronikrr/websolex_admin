const mongoose = require('mongoose')

const setstaticschema = new mongoose.Schema({
    successfulproject: { type: String, require: true },
    joiningcomparies: { type: String, require: true },
    registeredcustomers: { type: String, require: true },
})

const setstatic = mongoose.model('setstatic', setstaticschema);

module.exports = setstatic;