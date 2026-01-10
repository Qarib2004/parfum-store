import multer from 'multer';
import type { Request } from 'express';
import { CloudinaryUtil } from '../utils/cloudinary.util';

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (CloudinaryUtil.isImageFile(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('only image permission (JPEG, PNG, WEBP, GIF)'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
});

export const uploadSingle = upload.single('image');

export const uploadMultiple = upload.array('images', 5); // максимум 5 файлов

export const handleMulterError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'max size: 5MB',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'maximum: 5',
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'error for downloads image',
    });
  }
  
  next();
};