
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { config } from './env.config.js';
import CustomError from '../errors/CustomError.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOAD_ROOT = path.resolve(
    __dirname,
    '../../',
    config.nodeEnv === 'test' ? 'uploads-test' : 'uploads'
);

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = Object.freeze({
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png']
});

const FILE_SIGNATURES = Object.freeze({
    'application/pdf': Buffer.from([
        0x25, 0x50, 0x44, 0x46, 0x2D
    ]),

    'image/jpeg': Buffer.from([
        0xFF, 0xD8, 0xFF
    ]),

    'image/png': Buffer.from([
        0x89, 0x50, 0x4E, 0x47,
        0x0D, 0x0A, 0x1A, 0x0A
    ])
});

export const UPLOAD_FOLDERS = Object.freeze({
    DOCUMENTS: 'documents',
    LICENSES: 'licenses',
    DELIVERY_PROOFS: 'delivery-proofs'
});

for (const folder of Object.values(UPLOAD_FOLDERS)) {
    fs.mkdirSync(path.join(UPLOAD_ROOT, folder), {
        recursive: true
    });
}

const fileFilter = (req, file, cb) => {

    const extension = path.extname(
        file.originalname
    ).toLowerCase();

    if (!Object.hasOwn(ALLOWED_FILE_TYPES, file.mimetype)) {
        return cb(
            CustomError.create(ERROR_CODES.INVALID_FILE_TYPE)
        );
    }

    const allowedExtensions =
        ALLOWED_FILE_TYPES[file.mimetype];

    if (!allowedExtensions.includes(extension)) {
        return cb(
            CustomError.create(ERROR_CODES.INVALID_FILE_TYPE)
        );
    }

    return cb(null, true);
};

// Validar la firma binaria del archivo - Modulo 7
export const validateFileContent = (file) => {

    if (
        !file ||
        !Buffer.isBuffer(file.buffer) ||
        file.buffer.length === 0
    ) {
        throw CustomError.create(
            ERROR_CODES.FILE_REQUIRED
        );
    }

    if (!Object.hasOwn(FILE_SIGNATURES, file.mimetype)) {
        throw CustomError.create(
            ERROR_CODES.INVALID_FILE_TYPE
        );
    }

    const signature = FILE_SIGNATURES[file.mimetype];

    const validSignature =
        file.buffer.length >= signature.length &&
        file.buffer
            .subarray(0, signature.length)
            .equals(signature);

    if (!validSignature) {
        throw CustomError.create(
            ERROR_CODES.INVALID_FILE_TYPE
        );
    }

    return true;
};

export const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
        fields: 5,
        parts: 6,
        fieldSize: 1024
    },

    fileFilter
});

export const generateFileName = (originalName) => {

    const extension = path.extname(
        originalName
    ).toLowerCase();

    return `${randomUUID()}${extension}`;
};
