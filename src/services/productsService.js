
import productRepository from '../repositories/product.repository.js';
import { PRODUCT_STATUS } from '../constants/index.js';

import CustomError from '../errors/CustomError.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';

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
            throw CustomError.create(ERROR_CODES.PRODUCT_NOT_FOUND);
        }

        return product;
    }

    async create(productData) {
        if (
            !productData ||
            typeof productData !== 'object' ||
            Array.isArray(productData) ||
            !productData.title ||
            !productData.code ||
            productData.price === undefined
        ) {
            throw CustomError.create(ERROR_CODES.INVALID_PRODUCT_DATA);
        }

        if (
            typeof productData.price !== 'number' ||
            !Number.isFinite(productData.price) ||
            productData.price < 0
        ) {
            throw CustomError.create(ERROR_CODES.INVALID_PRODUCT_PRICE);
        }

        const existingProduct = await productRepository.findByCode(
            productData.code
        );

        if (existingProduct) {
            throw CustomError.create(ERROR_CODES.PRODUCT_ALREADY_EXISTS);
        }

        const stock = productData.stock ?? 0;

        if (
            typeof stock !== 'number' ||
            !Number.isInteger(stock) ||
            stock < 0
        ) {
            throw CustomError.create(
                ERROR_CODES.INVALID_PRODUCT_DATA,
                'El stock debe ser un número entero mayor o igual a cero'
            );
        }

        const newProduct = {
            ...productData,
            stock,
            status:
                stock > 0
                    ? PRODUCT_STATUS.AVAILABLE
                    : PRODUCT_STATUS.OUT_OF_STOCK
        };

        return await productRepository.create(newProduct);
    }

    async update(id, productData) {
        if (
            !productData ||
            typeof productData !== 'object' ||
            Array.isArray(productData)
        ) {
            throw CustomError.create(ERROR_CODES.INVALID_PRODUCT_DATA);
        }

        const dataToUpdate = { ...productData };

        if (dataToUpdate.price !== undefined) {
            if (
                typeof dataToUpdate.price !== 'number' ||
                !Number.isFinite(dataToUpdate.price) ||
                dataToUpdate.price < 0
            ) {
                throw CustomError.create(ERROR_CODES.INVALID_PRODUCT_PRICE);
            }
        }

        if (dataToUpdate.stock !== undefined) {
            if (
                typeof dataToUpdate.stock !== 'number' ||
                !Number.isInteger(dataToUpdate.stock) ||
                dataToUpdate.stock < 0
            ) {
                throw CustomError.create(
                    ERROR_CODES.INVALID_PRODUCT_DATA,
                    'El stock debe ser un número entero mayor o igual a cero'
                );
            }

            dataToUpdate.status =
                dataToUpdate.stock > 0
                    ? PRODUCT_STATUS.AVAILABLE
                    : PRODUCT_STATUS.OUT_OF_STOCK;
        } else if (
            dataToUpdate.status === 'Out_of_stock' ||
            dataToUpdate.status === 'OUT_OF_STOCK'
        ) {
            dataToUpdate.status = PRODUCT_STATUS.OUT_OF_STOCK;
        }

        const updatedProduct = await productRepository.update(
            id,
            dataToUpdate
        );

        if (!updatedProduct) {
            throw CustomError.create(ERROR_CODES.PRODUCT_NOT_FOUND);
        }

        return updatedProduct;
    }

    async delete(id) {
        const deletedProduct = await productRepository.delete(id);

        if (!deletedProduct) {
            throw CustomError.create(ERROR_CODES.PRODUCT_NOT_FOUND);
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
