
import CustomError from '../errors/CustomError.js';
import {
    ERROR_CODES,
    ERROR_DICTIONARY
} from '../errors/errorDictionary.js';
import logger from '../config/logger.config.js';

export const errorHandler = (err, req, res, next) => {
    let code = ERROR_CODES.INTERNAL_ERROR;
    let statusCode = 500;
    let message = ERROR_DICTIONARY[code].message;
    let details = null;

    if (err instanceof CustomError) {
        code = err.code;
        statusCode = err.statusCode;
        message = err.message;
        details = err.details;
    } else if (err.name === 'ValidationError') {
        code = ERROR_CODES.INVALID_DATA;
        statusCode = 400;
        message = ERROR_DICTIONARY[code].message;
    } else if (err.name === 'CastError') {
        code = ERROR_CODES.INVALID_ID;
        statusCode = 400;
        message = ERROR_DICTIONARY[code].message;
    } else if (err.code === 11000) {
        code = ERROR_CODES.DUPLICATE_RECORD;
        statusCode = 409;
        message = ERROR_DICTIONARY[code].message;
    }

    const logMessage = `${req.method} ${req.originalUrl} | ${code} | ${err.message}`;

    if (statusCode >= 500) {
        logger.error(logMessage, { stack: err.stack });
    } else {
        logger.warning(logMessage);
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
