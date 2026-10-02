import productRepository from "../repositories/product.repository.js";
import { PRODUCT_STATUS } from "../constants/index.js";
import AppError from "../utils/errors.js";

class ProductsService {
    async findAll(includeAll = false) {
        const products = await productRepository.findAll();

        if (includeAll) {
            return products;
        }

        return products.filter(
            (product) =>
                product.stock > 0 &&
                product.status === PRODUCT_STATUS.AVAILABLE
        );
    }

    async findById(id) {
        const product = await productRepository.findById(id);

        if (!product) {
            throw new AppError("Producto no encontrado", 404);
        }

        return product;
    }

    async create(productData) {
        if (
            !productData.title ||
            !productData.code ||
            productData.price === undefined
        ) {
            throw new AppError("Faltan campos obligatorios", 400);
        }

        if (productData.price < 0) {
            throw new AppError("Precio inválido", 400);
        }

        const existingProduct = await productRepository.findByCode(
            productData.code
        );

        if (existingProduct) {
            throw new AppError("El código del producto ya existe", 400);
        }

        const stock = productData.stock || 0;

        const newProduct = {
            ...productData,
            stock,
            status:
                stock > 0
                    ? PRODUCT_STATUS.AVAILABLE
                    : PRODUCT_STATUS.OUT_OF_STOCK
        };

        return productRepository.create(newProduct);
    }

    async update(id, productData) {
        const dataToUpdate = { ...productData };

        if (
            dataToUpdate.status === "Out_of_stock" ||
            dataToUpdate.status === "OUT_OF_STOCK"
        ) {
            dataToUpdate.status = PRODUCT_STATUS.OUT_OF_STOCK;
        }

        if (dataToUpdate.stock !== undefined) {
            dataToUpdate.status =
                dataToUpdate.stock > 0
                    ? PRODUCT_STATUS.AVAILABLE
                    : PRODUCT_STATUS.OUT_OF_STOCK;
        }

        const updatedProduct = await productRepository.update(
            id,
            dataToUpdate
        );

        if (!updatedProduct) {
            throw new AppError("Producto no encontrado", 404);
        }

        return updatedProduct;
    }

    async delete(id) {
        const deletedProduct = await productRepository.delete(id);

        if (!deletedProduct) {
            throw new AppError("Producto no encontrado", 404);
        }

        return deletedProduct;
    }

    async getShippingCost(id) {
        const product = await this.findById(id);

        const isProduction = false;
        const shippingCost = isProduction
            ? 50 + product.price * 0.01
            : 10;

        return {
            product: product._id,
            declaredValue: product.price,
            shippingCost
        };
    }
}

export default new ProductsService();