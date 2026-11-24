
import { Router } from 'express';

import mocksController from '../controllers/mocksController.js';
import CustomError from '../errors/CustomError.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';

const router = Router();

// Obtener usuarios ficticios
router.get('/users', (req, res, next) => {
    return mocksController.getUsers(req, res, next);
});

// Obtener repartidores ficticios
router.get('/drivers', (req, res, next) => {
    return mocksController.getDrivers(req, res, next);
});

// Generar datos ficticios
router.post('/generate', (req, res, next) => {

    const allowedEnvironments = [
        'development',
        'test'
    ];

    if (!allowedEnvironments.includes(process.env.NODE_ENV)) {
        return next(
            CustomError.create(ERROR_CODES.MOCKS_NOT_ALLOWED)
        );
    }

    return mocksController.generateData(req, res, next);
});

export default router;
