const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); // Import configured cloudinary instance

// Cloudinary storage setup for profile pictures
const profilePicStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_pics', // Cloudinary folder for profile pictures
    allowed_formats: ['jpg', 'jpeg', 'png'], // Supported formats for profile pics
    transformation: [{ width: 150, height: 150, crop: 'limit' }] // Optional transformation (resize)
  }
});

// Cloudinary storage setup for resumes
const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'resumes', // Cloudinary folder for resumes
    allowed_formats: ['pdf', 'docx', 'txt'], // Supported formats for resumes
  }
});

// Multer upload setup with separate storages
const profilePicUpload = multer({ 
  storage: profilePicStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // Set a 5MB limit for profile picture
});

const resumeUpload = multer({ 
  storage: resumeStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // Set a 10MB limit for resumes
});

module.exports = { profilePicUpload, resumeUpload };