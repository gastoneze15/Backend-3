
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

}

export default new OrderRepository();
