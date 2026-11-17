
import deliveriesService from '../services/deliveriesService.js';

class DeliveriesController {

    async findAll(req, res, next) {
        try {
            const deliveries = await deliveriesService.findAll();

            return res.status(200).json({
                status: 'success',
                payload: deliveries
            });
        } catch (error) {
            next(error);
        }
    }

    async findById(req, res, next) {
        try {
            const delivery = await deliveriesService.findById(req.params.id);

            return res.status(200).json({
                status: 'success',
                payload: delivery
            });
        } catch (error) {
            next(error);
        }
    }

}

export default new DeliveriesController();
