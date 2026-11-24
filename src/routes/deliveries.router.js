
import { Router } from 'express';
import deliveriesController from '../controllers/deliveriesController.js';
import { uploadSingleFile } from '../middlewares/upload.middleware.js';

const router = Router();

router.get('/', (req, res, next) => {
    deliveriesController.findAll(req, res, next);
});

router.get('/:id', (req, res, next) => {
    deliveriesController.findById(req, res, next);
});

router.post(
    '/:id/proof',
    uploadSingleFile,
    (req, res, next) => {
        deliveriesController.uploadProof(req, res, next);
    }
);

export default router;
