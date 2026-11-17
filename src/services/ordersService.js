
import mongoose from 'mongoose';

import orderRepository from '../repositories/order.repository.js';
import CustomError from '../errors/CustomError.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';

class OrdersService {

    async findAll() {
        return await orderRepository.findAll();
    }

    async findById(id) {

        if (!mongoose.isValidObjectId(id)) {
            throw CustomError.create(ERROR_CODES.INVALID_ID);
        }

        const order = await orderRepository.findById(id);

        if (!order) {
            throw CustomError.create(ERROR_CODES.ORDER_NOT_FOUND);
        }

        return order;
    }

}

export default new OrdersService();
