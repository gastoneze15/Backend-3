import { USER_ROLES } from "../constants/index.js";
import userRepository from "../repositories/user.repository.js";
import AppError from "../utils/errors.js";


class UsersService{

    async findAll(){
        return userRepository.findAll()
    }

    async findById(id){
        const user = await userRepository.findById(id)
        if(!user){
            throw new AppError("Usuario no encontrado", 404)
        }
        return user
    }

    async create(user){
        if(user.role === USER_ROLES.ADMIN){
            throw new AppError("No es posible crear admins desde este endpoint", 400)
        }

        const existingUser = await userRepository.findByEmail(user.email)
        if(existingUser){
            throw new AppError("Este email ya se encuentra registrado", 409)
        }

        return userRepository.create(user)
    }

    async update(id, user){
        const updatedUser = userRepository.update(id, user)
        if(!updatedUser){
            throw new AppError("Usuario no encontrado", 404)
        }

        return updatedUser
    }

    async delete(id){
        const deletedUser = userRepository.delete(id)

        if(!deletedUser){
            throw new AppError("Usuario no encontrado", 404)
        }

        return deletedUser
    }
}

export default new UsersService()