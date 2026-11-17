
import bcrypt from 'bcryptjs';

import mocksRepository from '../repositories/mocks.repository.js';
import logger from '../config/logger.config.js';
import {
    generateMockUsers,
    generateMockDrivers,
    generateMockOrder,
    generateMockDelivery
} from '../utils/mockGenerator.js';

import CustomError from '../errors/CustomError.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';

class MocksService {

    validateQuantity(quantity) {
        const value = Number(quantity);


        if (
            quantity === null ||
            typeof quantity === 'boolean' ||
            String(quantity).trim() === '' ||
            !Number.isSafeInteger(value) ||
            value <= 0 ||
            value > 100
        ) {
            logger.warning(
                `Cantidad inválida de mocks recibida: ${String(quantity)}`
            );

            throw CustomError.create(
                ERROR_CODES.INVALID_MOCK_QUANTITY,
                'La cantidad debe ser un número entero entre 1 y 100'
            );
        }


        return value;
    }

    getUsers(quantity = 10) {
        const validQuantity = this.validateQuantity(quantity);

        return generateMockUsers(validQuantity);
    }

    getDrivers(quantity = 10) {
        const validQuantity = this.validateQuantity(quantity);

        return generateMockDrivers(validQuantity);
    }


    async generateData(data = {}) {
        if (
            data === null ||
            typeof data !== 'object' ||
            Array.isArray(data)
        ) {
            throw CustomError.create(ERROR_CODES.INVALID_DATA);
        }

        const customerQuantity = this.validateQuantity(
            data.customers ?? 5
        );


        const driverQuantity = this.validateQuantity(
            data.drivers ?? 3
        );

        // Registros creados durante la generación
        const customers = [];
        const drivers = [];
        const orders = [];
        const deliveries = [];

        try {

            const mockCustomers = await Promise.all(
                generateMockUsers(customerQuantity).map(async (user) => ({
                    ...user,
                    password: await bcrypt.hash(user.password, 10)
                }))
            );

            const mockDrivers = await Promise.all(
                generateMockDrivers(driverQuantity).map(async (driver) => ({
                    ...driver,
                    password: await bcrypt.hash(driver.password, 10)
                }))
            );

            await mocksRepository.createUsers(mockCustomers, customers);
            await mocksRepository.createUsers(mockDrivers, drivers);

            const orderData = customers.map((customer) =>
                generateMockOrder(customer._id)
            );

            await mocksRepository.createOrders(orderData, orders);

            const deliveryData = orders.map((order, index) => {
                const driver = drivers[index % drivers.length];

                return generateMockDelivery(order._id, driver._id);
            });

            await mocksRepository.createDeliveries(
                deliveryData,
                deliveries
            );

            for (let index = 0; index < orders.length; index++) {
                orders[index].delivery = deliveries[index]._id;
                await orders[index].save();
            }

            const result = {
                customers: customers.length,
                drivers: drivers.length,
                orders: orders.length,
                deliveries: deliveries.length
            };

            logger.info(
                `Mocks generados correctamente: ${result.customers} clientes, ` +
                `${result.drivers} repartidores, ${result.orders} pedidos y ` +
                `${result.deliveries} entregas`
            );

            return result;


        } catch (error) {
            const cleanupResults = await Promise.allSettled([
                mocksRepository.deleteDeliveriesByIds(
                    deliveries.map((delivery) => delivery._id)
                ),
                mocksRepository.deleteOrdersByIds(
                    orders.map((order) => order._id)
                ),
                mocksRepository.deleteUsersByIds([
                    ...customers.map((customer) => customer._id),
                    ...drivers.map((driver) => driver._id)
                ])
            ]);

            if (cleanupResults.some((result) => result.status === 'rejected')) {
                logger.error('No se pudo completar la limpieza de mocks');
            }


            logger.error(`Error durante la generación de mocks: ${error.message}`, {
                stack: error.stack
            });

            throw CustomError.create(ERROR_CODES.DATABASE_ERROR);
        }
    }
}

export default new MocksService();
