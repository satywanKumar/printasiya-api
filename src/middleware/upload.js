const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'printasiya/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    resource_type: 'auto'
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('Checking file:', file.originalname, 'MIME:', file.mimetype);
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.mimetype);
    
    if (extname) {
      console.log('✅ File type allowed');
      return cb(null, true);
    } else {
      console.log('❌ File type not allowed:', file.mimetype);
      cb(new Error('Invalid file type. Only image files are allowed.'));
    }
  }
});

module.exports = upload;
