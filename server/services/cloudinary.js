const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary only if environment variables are provided
const isConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
} else {
  console.warn('Cloudinary credentials missing in environment. Profile images will be stored locally as a fallback.');
}

/**
 * Uploads a local file to Cloudinary.
 * @param {string} filePath - Absolute path to the local file.
 * @returns {Promise<string|null>} - The secure HTTPS URL from Cloudinary, or null if fallback.
 */
const uploadToCloudinary = async (filePath) => {
  if (!isConfigured) {
    return null;
  }
  
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'therasync_avatars',
      resource_type: 'image'
    });
    return result.secure_url;
  } catch (error) {
    console.error('[Cloudinary Upload Error]', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  isCloudinaryConfigured: () => isConfigured
};
