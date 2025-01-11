const mongoose = require('mongoose');

const viewCountSchema = new mongoose.Schema({
    count: {
        type: Number,
        default: 0
    }
});

const ViewCount = mongoose.model('ViewCount', viewCountSchema);

module.exports = ViewCount