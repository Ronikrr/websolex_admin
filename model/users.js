const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
    phoneNo: { type: String, match: /^[0-9]{10}$/ },
    username: { type: String },
    profileImage: { type: String },
    status: { type: String, default: 'pending' },
    role: { type: String, enum: ['user', 'admin', 'employee'], default: 'user' },
    workInCompany: {
        type: [String],
        enum: [
            'Digital Marketing',
            'React.js Developer',
            'Node.js Developer',
            'Full Stack Developer',
            'Shopify Developer',
            'WordPress Developer',

        ],
        default: []
    }
});

const User = mongoose.model('Users', UserSchema);

module.exports = User;

