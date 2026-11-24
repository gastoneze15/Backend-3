
import multer from 'multer';

import {
    upload,
    validateFileContent
} from '../config/multer.config.js';

import CustomError from '../errors/CustomError.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';
import logger from '../config/logger.config.js';

const singleFileUpload = upload.single('file');

export const uploadSingleFile = (req, res, next) => {

    if (!req.is('multipart/form-data')) {
        return next(
            CustomError.create(
                ERROR_CODES.INVALID_MULTIPART_DATA
            )
        );
    }

    singleFileUpload(req, res, (error) => {

        if (error) {

            if (error instanceof CustomError) {
                return next(error);
            }

            if (error instanceof multer.MulterError) {

                switch (error.code) {

                    case 'LIMIT_FILE_SIZE':
                        return next(
                            CustomError.create(
                                ERROR_CODES.FILE_TOO_LARGE
                            )
                        );

                    case 'LIMIT_UNEXPECTED_FILE':
                    case 'LIMIT_FILE_COUNT':
                        return next(
                            CustomError.create(
                                ERROR_CODES.INVALID_FILE_FIELD
                            )
                        );

                    default:
                        return next(
                            CustomError.create(
                                ERROR_CODES.INVALID_MULTIPART_DATA
                            )
                        );
                }
            }

            logger.warning(
                `Error al procesar la carga: ${error.message}`
            );

            return next(
                CustomError.create(
                    ERROR_CODES.INVALID_MULTIPART_DATA
                )
            );
        }

        if (!req.file || req.file.size === 0) {
            return next(
                CustomError.create(
                    ERROR_CODES.FILE_REQUIRED
                )
            );
        }

        // Validar contenido binario del archivo - Modulo 7
        try {

            validateFileContent(req.file);

        } catch (validationError) {

            return next(validationError);

        }

        return next();
    });
};
