
import { Router } from 'express';

import mocksController from '../controllers/mocksController.js';
import CustomError from '../errors/CustomError.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';

const router = Router();

// Devuelve clientes ficticios sin guardarlos
router.get('/users', (req, res, next) =>
    mocksController.getUsers(req, res, next)
);

// Devuelve repartidores ficticios sin guardarlos
router.get('/drivers', (req, res, next) =>
    mocksController.getDrivers(req, res, next)
);

// Inserta datos de prueba en MongoDB
router.post('/generate', (req, res, next) => {
    if (process.env.NODE_ENV !== 'development') {
        return next(
            CustomError.create(ERROR_CODES.MOCKS_NOT_ALLOWED)
        );
    }

    return mocksController.generateData(req, res, next);
});

export default router;