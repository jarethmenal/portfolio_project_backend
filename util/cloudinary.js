require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const name = process.env.CLOUDINARY_NAME;
const key = process.env.CLOUDINARY_API_KEY;
const secret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
    cloud_name: name,
    api_key: key,
    api_secret: secret
});

module.exports = { cloudinary };