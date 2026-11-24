
import Order from '../models/order.model.js';

class OrderRepository {

    async findAll() {
        return await Order.find()
            .populate('customer', 'firstName lastName email')
            .populate('delivery')
            .lean();
    }

    async findById(id) {
        return await Order.findById(id)
            .populate('customer', 'firstName lastName email')
            .populate('delivery')
            .lean();
    }

    async create(orderData) {
        const order = await Order.create(orderData);

        return await this.findById(order._id);
    }

    async updateStatus(id, status) {
        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            {
                new: true,
                runValidators: true
            }
        );

        if (!order) {
            return null;
        }

        return await this.findById(order._id);
    }

}

export default new OrderRepository();
