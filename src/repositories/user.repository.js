
import User from '../models/user.model.js';

class UsersRepository {

    async findAll() {
        return User.find();
    }

    async findById(id) {
        return User.findById(id);
    }

    async findByEmail(email) {
        return User.findOne({ email });
    }

    async create(user) {
        return User.create(user);
    }

    async update(id, updatedUser) {
        return User.findByIdAndUpdate(
            id,
            updatedUser,
            {
                new: true,
                runValidators: true
            }
        );
    }

    async delete(id) {
        return User.findByIdAndDelete(id);
    }

    // Asociar documentos al usuario - Modulo 7
    async addDocument(id, documentMetadata) {
        return User.findByIdAndUpdate(
            id,
            {
                $push: {
                    documents: documentMetadata
                }
            },
            {
                new: true,
                runValidators: true
            }
        ).select('-password');
    }
}

export default new UsersRepository();
