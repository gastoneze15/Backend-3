
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import logger from './config/logger.config.js';
import usersRouter from './routes/users.js';
import productsRouter from './routes/products.js';
import mocksRouter from './routes/mocks.router.js';
import loggerRouter from './routes/logger.router.js';
import ordersRouter from './routes/orders.router.js';
import deliveriesRouter from './routes/deliveries.router.js';
import { config } from './config/env.config.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.config.js';
import CustomError from './errors/CustomError.js';
import { ERROR_CODES } from './errors/errorDictionary.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/mocks', mocksRouter);
app.use('/api/logger', loggerRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/deliveries', deliveriesRouter);


app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

app.use((req, res, next) => {
    next(CustomError.create(ERROR_CODES.ROUTE_NOT_FOUND));
});

app.use(errorHandler);


mongoose.connect(config.mongoUri)
    .then(() => {
        logger.info('Conexión a MongoDB establecida correctamente');

        app.listen(config.port, () => {
            logger.info(`Servidor ShipNow escuchando en el puerto ${config.port}`);
        });
    })
    .catch((error) => {
        logger.fatal(`Error crítico al conectar con MongoDB: ${error.message}`);
        process.exit(1);
    });
