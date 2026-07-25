import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { upload, handleUpload } from '../controllers/upload.controller';

const router = Router();

router.post('/', authMiddleware, upload.single('image'), handleUpload);

export default router;
