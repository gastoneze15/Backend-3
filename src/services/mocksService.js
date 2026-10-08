import bcrypt from 'bcryptjs';
import mocksRepository from "../repositories/mocks.repository.js";
import {
    generateMockUsers,
    generateMockDrivers,
    generateMockOrder,
    generateMockDelivery,
} from "../utils/mockGenerator.js";

class MocksService {
    getUsers(quantity = 10) {
        return generateMockUsers(quantity);
    }

    getDrivers(quantity = 10) {
        return generateMockDrivers(quantity);
    }


    async generateData() {
        let customers = [];
        let drivers = [];
        let orders = [];
        let deliveries = [];

        try {
            const mockCustomers = await Promise.all(
                generateMockUsers(5).map(async (user) => ({
                    ...user,
                    password: await bcrypt.hash(user.password, 10)
                }))
            );

            const mockDrivers = await Promise.all(
                generateMockDrivers(3).map(async (driver) => ({
                    ...driver,
                    password: await bcrypt.hash(driver.password, 10)
                }))
            );

            customers = await mocksRepository.createUsers(mockCustomers);
            drivers = await mocksRepository.createUsers(mockDrivers);

            const orderData = customers.map((customer) =>
                generateMockOrder(customer._id)
            );

            orders = await mocksRepository.createOrders(orderData);

            const deliveryData = orders.map((order, index) => {
                const driver = drivers[index % drivers.length];
                return generateMockDelivery(order._id, driver._id);
            });

            deliveries = await mocksRepository.createDeliveries(deliveryData);

            for (let index = 0; index < orders.length; index++) {
                orders[index].delivery = deliveries[index]._id;
                await orders[index].save();
            }

            return {
                customers: customers.length,
                drivers: drivers.length,
                orders: orders.length,
                deliveries: deliveries.length
            };

        } catch (error) {
            // Intentamos limpiar los registros creados.
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
                console.error('No se pudo completar la limpieza de mocks');
            }

            throw error;
        }
    }

}

export default new MocksService();
