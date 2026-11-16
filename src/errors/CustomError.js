
import {
    ERROR_CODES,
    ERROR_DICTIONARY
} from './errorDictionary.js';

class CustomError extends Error {
    constructor(code, details = null) {
        const errorConfig =
            ERROR_DICTIONARY[code] ||
            ERROR_DICTIONARY[ERROR_CODES.INTERNAL_ERROR];

        super(errorConfig.message);

        this.name = 'CustomError';
        this.code = ERROR_DICTIONARY[code]
            ? code
            : ERROR_CODES.INTERNAL_ERROR;
        this.statusCode = errorConfig.statusCode;
        this.details = details;

        Error.captureStackTrace?.(this, CustomError);
    }

    static create(code, details = null) {
        return new CustomError(code, details);
    }
}

export default CustomError;
