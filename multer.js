const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require('./cloud'); 

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile_Image',
        allowed_formats: ['jpg', 'png', 'jpeg'], 
    },
});

const upload = multer({ storage: storage });

module.exports = upload;
