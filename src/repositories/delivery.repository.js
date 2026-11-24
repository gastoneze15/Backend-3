
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

    // Asociar comprobante de entrega - Modulo 7
    async addProof(id, proofMetadata) {

        return await Delivery.findOneAndUpdate(
            {
                _id: id,
                proof: null
            },
            {
                $set: {
                    proof: proofMetadata
                }
            },
            {
                new: true,
                runValidators: true
            }
        )
            .populate('order')
            .populate('driver', 'firstName lastName email')
            .lean();
    }
}

export default new DeliveryRepository();
