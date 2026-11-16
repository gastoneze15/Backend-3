
import { USER_ROLES } from '../constants/index.js';
import userRepository from '../repositories/user.repository.js';

import CustomError from '../errors/CustomError.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';

class UsersService {

    async findAll() {
        return await userRepository.findAll();
    }

    async findById(id) {
        const user = await userRepository.findById(id);

        if (!user) {
            throw CustomError.create(ERROR_CODES.USER_NOT_FOUND);
        }

        return user;
    }

    async create(user) {
        if (
            !user ||
            typeof user !== 'object' ||
            Array.isArray(user) ||
            !user.email ||
            typeof user.email !== 'string'
        ) {
            throw CustomError.create(ERROR_CODES.INVALID_USER_DATA);
        }

        if (user.role === USER_ROLES.ADMIN) {
            throw CustomError.create(
                ERROR_CODES.ADMIN_CREATION_FORBIDDEN
            );
        }

        const existingUser = await userRepository.findByEmail(user.email);

        if (existingUser) {
            throw CustomError.create(ERROR_CODES.USER_ALREADY_EXISTS);
        }

        return await userRepository.create(user);
    }

    async update(id, user) {
        const updatedUser = await userRepository.update(id, user);

        if (!updatedUser) {
            throw CustomError.create(ERROR_CODES.USER_NOT_FOUND);
        }

        return updatedUser;
    }

    async delete(id) {
        const deletedUser = await userRepository.delete(id);

        if (!deletedUser) {
            throw CustomError.create(ERROR_CODES.USER_NOT_FOUND);
        }

        return deletedUser;
    }
}

export default new UsersService();
