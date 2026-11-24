
import mongoose from 'mongoose';
import { config } from '../../src/config/env.config.js';

const TEST_DATABASE = 'shipnow_test';

function validateTestEnvironment() {
    if (config.nodeEnv !== 'test') {
        throw new Error(
            'SEGURIDAD: Las pruebas requieren NODE_ENV=test'
        );
    }

    const databaseUrl = new URL(config.mongoUri);
    const databaseName = decodeURIComponent(
        databaseUrl.pathname.slice(1)
    );

    if (databaseName !== TEST_DATABASE) {
        throw new Error(
            'SEGURIDAD: La base de datos debe ser shipnow_test'
        );
    }

    if (!['127.0.0.1', 'localhost'].includes(databaseUrl.hostname)) {
        throw new Error(
            'SEGURIDAD: Los tests solo pueden usar MongoDB local'
        );
    }
}

export async function connectTestDB() {
    validateTestEnvironment();

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(config.mongoUri);
    }
}

export async function clearTestDB() {
    validateTestEnvironment();

    if (mongoose.connection.readyState !== 1) {
        throw new Error(
            'No hay una conexión activa con MongoDB de testing'
        );
    }

    if (mongoose.connection.name !== TEST_DATABASE) {
        throw new Error(
            'SEGURIDAD: La conexión activa no corresponde a shipnow_test'
        );
    }

    const collections = Object.values(
        mongoose.connection.collections
    );

    for (const collection of collections) {
        await collection.deleteMany({});
    }
}

export async function disconnectTestDB() {
    await mongoose.disconnect();
}
