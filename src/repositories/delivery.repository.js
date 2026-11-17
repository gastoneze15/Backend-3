
import Delivery from '../models/delivery.model.js';

class DeliveryRepository {

    async findAll() {
        return await Delivery.find()
            .populate('order')
            .populate('driver', 'firstName lastName email')
            .lean();
    }

    async findById(id) {
        return await Delivery.findById(id)
            .populate('order')
            .populate('driver', 'firstName lastName email')
            .lean();
    }

}

export default new DeliveryRepository();
