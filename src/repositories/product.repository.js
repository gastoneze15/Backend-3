import Product from "../models/product.model.js";

class ProductRepository {
    async findAll() {
        return Product.find();
    }

    async findById(id) {
        return Product.findById(id);
    }

    async findByCode(code) {
        return Product.findOne({ code });
    }

    async create(product) {
        return Product.create(product);
    }

    async update(id, updatedProduct) {
        return Product.findByIdAndUpdate(
            id,
            updatedProduct,
            { new: true }
        );
    }

    async delete(id) {
        return Product.findByIdAndDelete(id);
    }
}

export default new ProductRepository();