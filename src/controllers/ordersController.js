
import ordersService from '../services/ordersService.js';

class OrdersController {

    async findAll(req, res, next) {
        try {
            const orders = await ordersService.findAll();

            return res.status(200).json({
                status: 'success',
                payload: orders
            });
        } catch (error) {
            next(error);
        }
    }

    async findById(req, res, next) {
        try {
            const order = await ordersService.findById(
                req.params.id
            );

            return res.status(200).json({
                status: 'success',
                payload: order
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const order = await ordersService.create(
                req.body
            );

            return res.status(201).json({
                status: 'success',
                payload: order
            });
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const updatedOrder = await ordersService.updateStatus(
                req.params.id,
                req.body?.status
            );

            return res.status(200).json({
                status: 'success',
                payload: updatedOrder
            });
        } catch (error) {
            next(error);
        }
    }

}

export default new OrdersController();
