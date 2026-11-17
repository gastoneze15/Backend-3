
import { Router } from 'express';
import deliveriesController from '../controllers/deliveriesController.js';

const router = Router();

router.get('/', (req, res, next) => {
    deliveriesController.findAll(req, res, next);
});

router.get('/:id', (req, res, next) => {
    deliveriesController.findById(req, res, next);
});

export default router;
