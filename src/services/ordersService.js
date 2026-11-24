
import mongoose from 'mongoose';

import orderRepository from '../repositories/order.repository.js';
import User from '../models/user.model.js';

import { ORDER_STATUS } from '../constants/index.js';
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

    async create(orderData) {

        if (
            !orderData ||
            typeof orderData !== 'object' ||
            Array.isArray(orderData) ||
            !mongoose.isValidObjectId(orderData.customer) ||
            !Array.isArray(orderData.items) ||
            orderData.items.length === 0 ||
            typeof orderData.deliveryAddress !== 'string' ||
            !orderData.deliveryAddress.trim()
        ) {
            throw CustomError.create(ERROR_CODES.INVALID_DATA);
        }

        for (const item of orderData.items) {
            if (
                !item ||
                typeof item.name !== 'string' ||
                !item.name.trim() ||
                !Number.isInteger(item.quantity) ||
                item.quantity < 1 ||
                typeof item.price !== 'number' ||
                !Number.isFinite(item.price) ||
                item.price < 0
            ) {
                throw CustomError.create(ERROR_CODES.INVALID_DATA);
            }
        }

        const customerExists = await User.exists({
            _id: orderData.customer
        });

        if (!customerExists) {
            throw CustomError.create(ERROR_CODES.INVALID_DATA);
        }

        const total = orderData.items.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0
        );

        return await orderRepository.create({
            customer: orderData.customer,
            items: orderData.items,
            deliveryAddress: orderData.deliveryAddress.trim(),
            total
        });
    }

    async updateStatus(id, status) {

        if (!mongoose.isValidObjectId(id)) {
            throw CustomError.create(ERROR_CODES.INVALID_ID);
        }

        if (
            typeof status !== 'string' ||
            !Object.values(ORDER_STATUS).includes(status)
        ) {
            throw CustomError.create(
                ERROR_CODES.INVALID_ORDER_STATUS
            );
        }

        const updatedOrder = await orderRepository.updateStatus(
            id,
            status
        );

        if (!updatedOrder) {
            throw CustomError.create(
                ERROR_CODES.ORDER_NOT_FOUND
            );
        }

        return updatedOrder;
    }

}

export default new OrdersService();
