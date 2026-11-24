
import { Router } from 'express';

import logger from '../config/logger.config.js';
import { config } from '../config/env.config.js';
import CustomError from '../errors/CustomError.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';

const router = Router();

// Endpoint para probar los niveles del logger
router.get('/test', (req, res, next) => {
    try {

        const allowedEnvironments = [
            'development',
            'test'
        ];

        // Permitir únicamente desarrollo y testing
        if (!allowedEnvironments.includes(config.nodeEnv)) {
            throw CustomError.create(
                ERROR_CODES.LOGGER_NOT_ALLOWED
            );
        }

        // Probar todos los niveles del logger
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
