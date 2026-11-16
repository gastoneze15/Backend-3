
import productsService from '../services/productsService.js';

class ProductsController {

    async findAll(req, res, next) {
        try {
            const includeAll = req.query.all === 'true';
            const products = await productsService.findAll(includeAll);

            return res.status(200).json({
                status: 'success',
                payload: products
            });
        } catch (error) {
            next(error);
        }
    }

    async findById(req, res, next) {
        try {
            const product = await productsService.findById(req.params.id);

            return res.status(200).json({
                status: 'success',
                payload: product
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const product = await productsService.create(req.body);

            return res.status(201).json({
                status: 'success',
                payload: product
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const product = await productsService.update(
                req.params.id,
                req.body
            );

            return res.status(200).json({
                status: 'success',
                payload: product
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await productsService.delete(req.params.id);

            return res.status(200).json({
                status: 'success',
                message: 'Producto eliminado'
            });
        } catch (error) {
            next(error);
        }
    }

    async getShippingCost(req, res, next) {
        try {
            const shipping = await productsService.getShippingCost(
                req.params.id
            );

            return res.status(200).json({
                status: 'success',
                payload: shipping
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new ProductsController();
