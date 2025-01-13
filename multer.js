const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require('./cloud'); // Import the Cloudinary configuration

// Create a Cloudinary Storage instance
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile_Image', // Specify the folder name in Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed file formats
    },
});

// Initialize multer with Cloudinary storage
const upload = multer({ storage: storage });

module.exports = upload;
