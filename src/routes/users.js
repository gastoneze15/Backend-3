
import { Router } from 'express';
import usersContoller from '../controllers/usersContoller.js';
import { uploadSingleFile } from '../middlewares/upload.middleware.js';

const router = Router();

router.get('/', usersContoller.findAll);

router.get('/:id', usersContoller.findById);

router.post('/', usersContoller.create);

router.post(
    '/:id/documents',
    uploadSingleFile,
    usersContoller.uploadDocument
);

router.put('/:id', usersContoller.update);

router.delete('/:id', usersContoller.delete);

export default router;
