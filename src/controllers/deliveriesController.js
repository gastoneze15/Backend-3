
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

    // Cargar comprobante de entrega - Modulo 7
    async uploadProof(req, res, next) {
        try {

            const updatedDelivery = await deliveriesService.uploadProof(
                req.params.id,
                req.file
            );

            return res.status(201).json({
                status: 'success',
                message: 'Comprobante de entrega cargado correctamente',
                payload: updatedDelivery
            });

        } catch (error) {
            next(error);
        }
    }
}

export default new DeliveriesController();
