import productsService from "../services/productsService.js";

class ProductsController {
    async findAll(req, res) {
        try {
            const includeAll = req.query.all === "true";
            const products = await productsService.findAll(includeAll);

            return res.status(200).json({
                status: "success",
                payload: products
            });
        } catch (e) {
            return res.status(e.statusCode || 500).json({
                status: "error",
                message: e.message
            });
        }
    }

    async findById(req, res) {
        try {
            const product = await productsService.findById(req.params.id);

            return res.status(200).json({
                status: "success",
                payload: product
            });
        } catch (e) {
            return res.status(e.statusCode || 500).json({
                status: "error",
                message: e.message
            });
        }
    }

    async create(req, res) {
        try {
            const product = await productsService.create(req.body);

            return res.status(201).json({
                status: "success",
                payload: product
            });
        } catch (e) {
            return res.status(e.statusCode || 500).json({
                status: "error",
                message: e.message
            });
        }
    }

    async update(req, res) {
        try {
            const product = await productsService.update(
                req.params.id,
                req.body
            );

            return res.status(200).json({
                status: "success",
                payload: product
            });
        } catch (e) {
            return res.status(e.statusCode || 500).json({
                status: "error",
                message: e.message
            });
        }
    }

    async delete(req, res) {
        try {
            await productsService.delete(req.params.id);

            return res.status(200).json({
                status: "success",
                message: "Producto eliminado"
            });
        } catch (e) {
            return res.status(e.statusCode || 500).json({
                status: "error",
                message: e.message
            });
        }
    }

    async getShippingCost(req, res) {
        try {
            const shipping = await productsService.getShippingCost(
                req.params.id
            );

            return res.status(200).json({
                status: "success",
                payload: shipping
            });
        } catch (e) {
            return res.status(e.statusCode || 500).json({
                status: "error",
                message: e.message
            });
        }
    }
}

export default new ProductsController();