const mongoose = require('mongoose')

const subscribeSchema = new mongoose.Schema({
    email: { type: String, require: true },
})

const subscribe = mongoose.model('subscribe', subscribeSchema)

module.exports = subscribe