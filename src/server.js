
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import usersRouter from './routes/users.js';
import productsRouter from './routes/products.js';
import mocksRouter from './routes/mocks.router.js';

import { config } from './config/env.config.js';

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
        app.listen(config.port, () => {
            console.log(`Servidor corriendo en puerto ${config.port}`);
        });
    })
    .catch((error) => {
        console.error('Error de conexión a MongoDB:', error);
        process.exitCode = 1;
    });
