import { Request, Response, NextFunction } from 'express';
import multer, { type FileFilterCallback } from 'multer';
import { uploadImage } from '../utils/cloudinary';
import type { AuthRequest } from '../middlewares/auth.middleware';

const MAX_SIZE = 4 * 1024 * 1024;

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, WEBP, and GIF images are allowed'));
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

export const handleUpload = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const result = await uploadImage(req.file.buffer, req.file.mimetype, req.file.originalname);

    res.json({ url: result.url, publicId: result.publicId });
  } catch (error) {
    next(error);
  }
};
