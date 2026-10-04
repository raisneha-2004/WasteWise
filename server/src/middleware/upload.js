import multer from 'multer';
import { AppError } from '../utils/AppError.js';

// Multer memory storage configuration (keeps image in buffer for Sharp & AI)
const storage = multer.memoryStorage();

// Allowed MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

const multerUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB max
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
      return cb(new AppError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.', 400, 'INVALID_FILE_TYPE'));
    }
    cb(null, true);
  }
});

/**
 * Validates buffer against known image magic bytes (signatures)
 * @param {Buffer} buffer
 * @returns {boolean}
 */
export function validateImageMagicBytes(buffer) {
  if (!buffer || buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true;
  }

  // WebP: RIFF ... WEBP (52 49 46 46 .... 57 45 42 50)
  const isRiff =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46;

  const isWebp =
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;

  if (isRiff && isWebp) {
    return true;
  }

  return false;
}

/**
 * Middleware that handles single file upload and verifies genuine image magic bytes
 */
export function uploadWasteImage(req, res, next) {
  const uploadSingle = multerUpload.single('image');

  uploadSingle(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File size exceeds the 10MB limit.', 400, 'FILE_TOO_LARGE'));
        }
        return next(new AppError(`Upload error: ${err.message}`, 400, 'UPLOAD_ERROR'));
      }
      return next(err);
    }

    if (!req.file) {
      return next(new AppError('No image file provided. Please attach an image under the "image" field.', 400, 'MISSING_FILE'));
    }

    // Verify actual file content magic bytes
    if (!validateImageMagicBytes(req.file.buffer)) {
      return next(
        new AppError('Corrupted or invalid image format detected. File signature does not match JPEG, PNG, or WebP.', 400, 'INVALID_IMAGE_SIGNATURE')
      );
    }

    next();
  });
}
