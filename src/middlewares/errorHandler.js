
import CustomError from '../errors/CustomError.js';

import {
    ERROR_CODES,
    ERROR_DICTIONARY
} from '../errors/errorDictionary.js';

export const errorHandler = (err, req, res, next) => {
    let code = ERROR_CODES.INTERNAL_ERROR;
    let statusCode = 500;
    let message = ERROR_DICTIONARY[code].message;
    let details = null;

    if (err instanceof CustomError) {
        if (ERROR_DICTIONARY[err.code]) {
            code = err.code;
            statusCode = ERROR_DICTIONARY[code].statusCode;
            message = err.message;
            details = err.details ?? null;
        } else {
            console.error('Código de error personalizado desconocido:', err.code);
        }
    } else if (err?.name === 'ValidationError') {
        code = ERROR_CODES.INVALID_DATA;
        statusCode = ERROR_DICTIONARY[code].statusCode;
        message = ERROR_DICTIONARY[code].message;
    } else if (err?.name === 'CastError') {
        code = ERROR_CODES.INVALID_ID;
        statusCode = ERROR_DICTIONARY[code].statusCode;
        message = ERROR_DICTIONARY[code].message;
    } else if (err?.code === 11000) {
        code = ERROR_CODES.DUPLICATE_RECORD;
        statusCode = ERROR_DICTIONARY[code].statusCode;
        message = ERROR_DICTIONARY[code].message;
    } else {
        console.error('Error no controlado:', err);
    }

    const response = {
        status: 'error',
        code,
        message
    };

    if (details !== null) {
        response.details = details;
    }

    return res.status(statusCode).json(response);
};
