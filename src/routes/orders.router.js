
import { Router } from 'express';
import ordersController from '../controllers/ordersController.js';

const router = Router();

router.get('/', (req, res, next) => {
    ordersController.findAll(req, res, next);
});

router.post('/', (req, res, next) => {
    ordersController.create(req, res, next);
});

router.patch('/:id/status', (req, res, next) => {
    ordersController.updateStatus(req, res, next);
});

router.get('/:id', (req, res, next) => {
    ordersController.findById(req, res, next);
});

export default router;
