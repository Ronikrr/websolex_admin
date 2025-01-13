const cloudinary = require('cloudinary').v2;

const CLOUD_NAME = process.env.CLUDE_NAME
const CLOUD_KEY = process.env.CLOUD_API_KEY
const CLOUD_SECRATE = process.env.CLOUD_API_SECRET

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_KEY,
    api_secret: CLOUD_SECRATE,
});

module.exports = cloudinary;
