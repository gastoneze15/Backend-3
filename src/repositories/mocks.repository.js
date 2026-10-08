
import User from '../models/user.model.js';
import Order from '../models/order.model.js';
import Delivery from '../models/delivery.model.js';

class MocksRepository {


    async createUsers(users, created = []) {
        for (const user of users) {
            const savedUser = await User.create(user);
            created.push(savedUser);
        }

        return created;
    }

    async createOrders(orders, created = []) {
        for (const order of orders) {
            const savedOrder = await Order.create(order);
            created.push(savedOrder);
        }

        return created;
    }

    async createDeliveries(deliveries, created = []) {
        for (const delivery of deliveries) {
            const savedDelivery = await Delivery.create(delivery);
            created.push(savedDelivery);
        }

        return created;
    }


    async deleteUsersByIds(ids) {
        return User.deleteMany({ _id: { $in: ids } });
    }

    async deleteOrdersByIds(ids) {
        return Order.deleteMany({ _id: { $in: ids } });
    }

    async deleteDeliveriesByIds(ids) {
        return Delivery.deleteMany({ _id: { $in: ids } });
    }

}
export default new MocksRepository();
