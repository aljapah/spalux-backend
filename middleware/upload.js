const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'spalux',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov'],
    resource_type: 'auto',
  },
});

const upload = multer({ storage: storage });

module.exports = upload;