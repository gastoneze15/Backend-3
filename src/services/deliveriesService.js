
import mongoose from 'mongoose';

import { DOCUMENT_TYPES } from '../constants/index.js';

import deliveryRepository from '../repositories/delivery.repository.js';
import filesService from './filesService.js';

import CustomError from '../errors/CustomError.js';
import { ERROR_CODES } from '../errors/errorDictionary.js';
import logger from '../config/logger.config.js';

class DeliveriesService {

    async findAll() {
        return await deliveryRepository.findAll();
    }

    async findById(id) {

        if (!mongoose.isObjectIdOrHexString(id)) {
            throw CustomError.create(
                ERROR_CODES.INVALID_ID
            );
        }

        const delivery = await deliveryRepository.findById(id);

        if (!delivery) {
            throw CustomError.create(
                ERROR_CODES.DELIVERY_NOT_FOUND
            );
        }

        return delivery;
    }

    // Cargar comprobante de entrega - Modulo 7
    async uploadProof(id, file) {

        if (!mongoose.isObjectIdOrHexString(id)) {
            throw CustomError.create(
                ERROR_CODES.INVALID_ID
            );
        }

        if (!file) {
            throw CustomError.create(
                ERROR_CODES.FILE_REQUIRED
            );
        }

        const delivery = await this.findById(id);

        if (delivery.proof) {
            throw CustomError.create(
                ERROR_CODES.PROOF_ALREADY_EXISTS
            );
        }

        const metadata = await filesService.saveFile(
            file,
            DOCUMENT_TYPES.DELIVERY_PROOF
        );

        let updatedDelivery;

        try {

            updatedDelivery = await deliveryRepository.addProof(
                id,
                metadata
            );

            if (!updatedDelivery) {

                const currentDelivery =
                    await deliveryRepository.findById(id);

                if (!currentDelivery) {
                    throw CustomError.create(
                        ERROR_CODES.DELIVERY_NOT_FOUND
                    );
                }

                throw CustomError.create(
                    ERROR_CODES.PROOF_ALREADY_EXISTS
                );
            }

        } catch (error) {

            await filesService.deleteFile(metadata.path);

            logger.error(
                `Error al asociar comprobante a la entrega ${id}: ${error.message}`
            );

            throw error;
        }

        logger.info(
            `Comprobante ${metadata.fileName} asociado correctamente a la entrega ${id}`
        );

        return updatedDelivery;
    }
}

export default new DeliveriesService();
