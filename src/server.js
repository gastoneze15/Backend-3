
import mongoose from 'mongoose';

import app from './app.js';
import logger from './config/logger.config.js';
import { config } from './config/env.config.js';

mongoose.connect(config.mongoUri)
    .then(() => {
        logger.info('Conexión a MongoDB establecida correctamente');

        app.listen(config.port, () => {
            logger.info(
                `Servidor ShipNow escuchando en el puerto ${config.port}`
            );
        });
    })
    .catch((error) => {
        logger.fatal(
            `Error crítico al conectar con MongoDB: ${error.message}`
        );

        process.exit(1);
    });
