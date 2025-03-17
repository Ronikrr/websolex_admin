const mongoose = require('mongoose');

const LoginHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    loginTime: { type: Date, default: Date.now }
});

const LoginHistory = mongoose.model('LoginHistory', LoginHistorySchema);
module.exports = LoginHistory
