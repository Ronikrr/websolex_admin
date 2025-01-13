const cloudinary = require('cloudinary').v2;

const CLOUD_NAME = process.env.CLUDE_NAME
const CLOUD_KEY = process.env.CLOUD_API_KEY
const CLOUD_SECRATE = process.env.CLOUD_API_SECRET

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: 'duryg51ts', // Replace with your Cloudinary Cloud Name
    api_key: '379864533116736',       // Replace with your API Key
    api_secret: 'yE3xOwqat8n-hS5zfRv2EVV5gS8', // Replace with your API Secret
});

module.exports = cloudinary;
