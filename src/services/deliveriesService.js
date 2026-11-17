
import mongoose from 'mongoose';

import deliveryRepository from '../repositories/delivery.repository.js';
import CustomError from '../errors/CustomError.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';

class DeliveriesService {

    async findAll() {
        return await deliveryRepository.findAll();
    }

    async findById(id) {

        if (!mongoose.isValidObjectId(id)) {
            throw CustomError.create(ERROR_CODES.INVALID_ID);
        }

        const delivery = await deliveryRepository.findById(id);

        if (!delivery) {
            throw CustomError.create(ERROR_CODES.DELIVERY_NOT_FOUND);
        }

        return delivery;
    }

}

export default new DeliveriesService();
