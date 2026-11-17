
import { Router } from 'express';
import logger from '../config/logger.config.js';
import CustomError from '../errors/CustomError.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';

const router = Router();

router.get('/test', (req, res, next) => {
    try {
        if (process.env.NODE_ENV !== 'development') {
            throw CustomError.create(ERROR_CODES.MOCKS_NOT_ALLOWED);
        }

        logger.debug('Prueba del nivel DEBUG');
        logger.http('Prueba del nivel HTTP');
        logger.info('Prueba del nivel INFO');
        logger.warning('Prueba del nivel WARNING');
        logger.error('Prueba del nivel ERROR');
        logger.fatal('Prueba del nivel FATAL');

        return res.status(200).json({
            status: 'success',
            message: 'Prueba de logging ejecutada correctamente',
            levels: [
                'debug',
                'http',
                'info',
                'warning',
                'error',
                'fatal'
            ]
        });
    } catch (error) {
        next(error);
    }
});

export default router;
