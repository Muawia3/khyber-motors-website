import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'lg7mgh99',
  api_key: process.env.CLOUDINARY_API_KEY || '266638272518437',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'aIL_UxyB7oZ3sXayh_khCyE6CrQ',
  secure: true,
});


/**
 * Uploads a local file or buffer to Cloudinary and returns its permanent HTTPS CDN URL.
 * @param {string|Buffer} source - Absolute file path or Buffer to upload.
 * @param {object} options - Optional upload settings (folder, resource_type, filename).
 * @returns {Promise<{ url: string, publicId: string, format: string }>}
 */
async function singleUploadAttempt(source, options = {}) {
  const isPdf = typeof source === 'string'
    ? source.toLowerCase().endsWith('.pdf')
    : (options.filename && options.filename.toLowerCase().endsWith('.pdf'));

  const uploadOptions = {
    folder: options.folder || 'jac_motors',
    resource_type: isPdf ? 'raw' : 'auto',
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    ...options,
  };

  let result;
  if (typeof source === 'string' && (fs.existsSync(source) || source.startsWith('http://') || source.startsWith('https://'))) {
    result = await cloudinary.uploader.upload(source, uploadOptions);
  } else if (Buffer.isBuffer(source)) {
    result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, res) => {
        if (error) return reject(error);
        resolve(res);
      });
      uploadStream.end(source);
    });
  } else {
    throw new Error('Invalid source provided to uploadToCloudinary.');
  }

  if (result && result.secure_url) {
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format || (isPdf ? 'pdf' : 'jpeg'),
    };
  }

  throw new Error('Cloudinary upload returned empty secure_url.');
}

export async function uploadToCloudinary(source, options = {}, retries = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await singleUploadAttempt(source, options);
    } catch (error) {
      lastError = error;
      console.warn(`Cloudinary upload attempt ${attempt}/${retries} failed for ${source}:`, error.message || error);
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  throw lastError;
}

export default cloudinary;
