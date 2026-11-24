
import fs from 'node:fs/promises';
import path from 'node:path';

import {
    UPLOAD_ROOT,
    UPLOAD_FOLDERS,
    MAX_FILE_SIZE,
    generateFileName,
    validateFileContent
} from '../config/multer.config.js';

import { DOCUMENT_TYPES } from '../constants/index.js';
import CustomError from '../errors/CustomError.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';
import logger from '../config/logger.config.js';

class FilesService {

    // Determinar la carpeta según el tipo de documento
    getFolder(documentType) {

        switch (documentType) {

            case DOCUMENT_TYPES.USER_DOCUMENT:
                return UPLOAD_FOLDERS.DOCUMENTS;

            case DOCUMENT_TYPES.DRIVER_LICENSE:
                return UPLOAD_FOLDERS.LICENSES;

            case DOCUMENT_TYPES.DELIVERY_PROOF:
                return UPLOAD_FOLDERS.DELIVERY_PROOFS;

            default:
                throw CustomError.create(
                    ERROR_CODES.INVALID_DOCUMENT_TYPE
                );
        }
    }

    // Validar el archivo antes de almacenarlo
    validateFileContent(file) {

        if (
            !file ||
            !Buffer.isBuffer(file.buffer) ||
            file.buffer.length === 0
        ) {
            throw CustomError.create(
                ERROR_CODES.FILE_REQUIRED
            );
        }

        if (file.buffer.length > MAX_FILE_SIZE) {
            throw CustomError.create(
                ERROR_CODES.FILE_TOO_LARGE
            );
        }

        // Reutilizar la validación binaria centralizada
        return validateFileContent(file);
    }

    // Guardar el archivo y generar sus metadatos
    async saveFile(file, documentType) {

        const folder = this.getFolder(documentType);

        this.validateFileContent(file);

        const fileName = generateFileName(
            file.originalname
        );

        const directory = path.join(
            UPLOAD_ROOT,
            folder
        );

        const absolutePath = path.join(
            directory,
            fileName
        );

        const relativePath = path.posix.join(
            folder,
            fileName
        );

        try {

            await fs.mkdir(directory, {
                recursive: true
            });

            await fs.writeFile(
                absolutePath,
                file.buffer,
                { flag: 'wx' }
            );

        } catch (error) {

            if (error.code !== 'EEXIST') {
                await this.deleteFile(relativePath);
            }

            logger.error(
                `Error al guardar archivo: ${error.message}`
            );

            throw CustomError.create(
                ERROR_CODES.FILE_UPLOAD_ERROR
            );
        }

        logger.info(
            `Archivo almacenado correctamente: ${relativePath}`
        );

        return {
            originalName: file.originalname,
            fileName,
            path: relativePath,
            mimeType: file.mimetype,
            size: file.buffer.length,
            documentType,
            uploadedAt: new Date()
        };
    }

    // Eliminar archivos ante errores de asociación
    async deleteFile(relativePath) {

        const absolutePath = path.resolve(
            UPLOAD_ROOT,
            relativePath
        );

        const relative = path.relative(
            UPLOAD_ROOT,
            absolutePath
        );

        if (
            !relative ||
            relative === '..' ||
            relative.startsWith(`..${path.sep}`) ||
            path.isAbsolute(relative)
        ) {
            logger.warning(
                'Intento de eliminación fuera del directorio de uploads'
            );

            return false;
        }

        try {

            await fs.unlink(absolutePath);

            logger.info(
                `Archivo eliminado correctamente: ${relativePath}`
            );

            return true;

        } catch (error) {

            if (error.code === 'ENOENT') {
                return true;
            }

            logger.error(
                `Error al eliminar archivo: ${error.message}`
            );

            return false;
        }
    }
}

export default new FilesService();
