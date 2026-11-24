
import mongoose from 'mongoose';

import {
    USER_ROLES,
    DOCUMENT_TYPES
} from '../constants/index.js';

import userRepository from '../repositories/user.repository.js';
import filesService from './filesService.js';

import CustomError from '../errors/CustomError.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';
import logger from '../config/logger.config.js';

class UsersService {

    // Validar datos permitidos del usuario
    validateUserData(user) {

        if (
            !user ||
            typeof user !== 'object' ||
            Array.isArray(user)
        ) {
            throw CustomError.create(
                ERROR_CODES.INVALID_USER_DATA
            );
        }

        const allowedFields = [
            'firstName',
            'lastName',
            'email',
            'password',
            'role'
        ];

        const invalidFields = Object.keys(user).some(
            field => !allowedFields.includes(field)
        );

        if (invalidFields) {
            throw CustomError.create(
                ERROR_CODES.INVALID_USER_DATA
            );
        }
    }

    async findAll() {
        return await userRepository.findAll();
    }

    async findById(id) {

        const user = await userRepository.findById(id);

        if (!user) {
            throw CustomError.create(
                ERROR_CODES.USER_NOT_FOUND
            );
        }

        return user;
    }

    async create(user) {

        this.validateUserData(user);

        if (
            !user.email ||
            typeof user.email !== 'string'
        ) {
            throw CustomError.create(
                ERROR_CODES.INVALID_USER_DATA
            );
        }

        if (user.role === USER_ROLES.ADMIN) {
            throw CustomError.create(
                ERROR_CODES.ADMIN_CREATION_FORBIDDEN
            );
        }

        const existingUser =
            await userRepository.findByEmail(user.email);

        if (existingUser) {
            throw CustomError.create(
                ERROR_CODES.USER_ALREADY_EXISTS
            );
        }

        return await userRepository.create(user);
    }

    async update(id, user) {

        this.validateUserData(user);

        if (user.role === USER_ROLES.ADMIN) {
            throw CustomError.create(
                ERROR_CODES.ADMIN_CREATION_FORBIDDEN
            );
        }

        const updatedUser =
            await userRepository.update(id, user);

        if (!updatedUser) {
            throw CustomError.create(
                ERROR_CODES.USER_NOT_FOUND
            );
        }

        return updatedUser;
    }

    async delete(id) {

        const deletedUser =
            await userRepository.delete(id);

        if (!deletedUser) {
            throw CustomError.create(
                ERROR_CODES.USER_NOT_FOUND
            );
        }

        return deletedUser;
    }

    // Cargar documentos del usuario - Modulo 7
    async uploadDocument(id, file, documentType) {

        if (!mongoose.isObjectIdOrHexString(id)) {
            throw CustomError.create(
                ERROR_CODES.INVALID_ID
            );
        }

        if (!file) {
            throw CustomError.create(
                ERROR_CODES.FILE_REQUIRED
            );
        }

        const allowedDocumentTypes = [
            DOCUMENT_TYPES.USER_DOCUMENT,
            DOCUMENT_TYPES.DRIVER_LICENSE
        ];

        if (!allowedDocumentTypes.includes(documentType)) {
            throw CustomError.create(
                ERROR_CODES.INVALID_DOCUMENT_TYPE
            );
        }

        const user = await userRepository.findById(id);

        if (!user) {
            throw CustomError.create(
                ERROR_CODES.USER_NOT_FOUND
            );
        }

        const metadata = await filesService.saveFile(
            file,
            documentType
        );

        let updatedUser;

        try {

            updatedUser = await userRepository.addDocument(
                id,
                metadata
            );

            if (!updatedUser) {
                throw CustomError.create(
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

        } catch (error) {

            await filesService.deleteFile(metadata.path);

            logger.error(
                `Error al asociar documento al usuario ${id}: ${error.message}`
            );

            throw error;
        }

        logger.info(
            `Documento ${metadata.fileName} asociado correctamente al usuario ${id}`
        );

        return updatedUser;
    }
}

export default new UsersService();
