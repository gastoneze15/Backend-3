
import { expect } from 'chai';
import request from 'supertest';

import app from '../src/app.js';
import Delivery from '../src/models/delivery.model.js';

import {
    connectTestDB,
    clearTestDB,
    disconnectTestDB
} from './helpers/testDb.js';

describe('ShipNow API - Deliveries', function () {

    before(async function () {
        await connectTestDB();
        await clearTestDB();
    });

    after(async function () {
        await clearTestDB();
        await disconnectTestDB();
    });

    describe('GET /api/deliveries', function () {

        it('Debe obtener correctamente la lista de entregas', async function () {

            const response = await request(app)
                .get('/api/deliveries');

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal('success');
            expect(response.body.payload).to.be.an('array');

        });

    });

    describe('GET /api/deliveries/:id', function () {

        it('Debe obtener una entrega existente por su ID', async function () {

            // Crear un usuario de prueba
            const userResponse = await request(app)
                .post('/api/users')
                .send({
                    firstName: 'Cliente',
                    lastName: 'Delivery Test',
                    email: 'deliverytest@shipnow.com',
                    password: '123456'
                });

            expect(userResponse.status).to.equal(201);

            // Crear un pedido de prueba
            const orderResponse = await request(app)
                .post('/api/orders')
                .send({
                    customer: userResponse.body.payload._id,
                    items: [
                        {
                            name: 'Producto de prueba',
                            quantity: 1,
                            price: 2500
                        }
                    ],
                    deliveryAddress: 'Av. Santa Fe 1234'
                });

            expect(orderResponse.status).to.equal(201);

            // Crear una entrega en la base de testing
            const delivery = await Delivery.create({
                order: orderResponse.body.payload._id,
                status: 'pending',
                priority: 'normal'
            });

            // Consultar la entrega mediante la API
            const response = await request(app)
                .get(`/api/deliveries/${delivery._id}`);

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal('success');

            expect(response.body.payload).to.be.an('object');
            expect(response.body.payload._id).to.equal(
                delivery._id.toString()
            );

            expect(response.body.payload.status).to.equal('pending');
            expect(response.body.payload.priority).to.equal('normal');

        });

        it('Debe devolver 400 si el ID es inválido', async function () {

            const response = await request(app)
                .get('/api/deliveries/id-invalido');

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal('error');
            expect(response.body.code).to.equal('INVALID_ID');
            expect(response.body.message).to.be.a('string');

        });

        it('Debe devolver 404 si la entrega no existe', async function () {

            const nonexistentId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .get(`/api/deliveries/${nonexistentId}`);

            expect(response.status).to.equal(404);
            expect(response.body.status).to.equal('error');
            expect(response.body.code).to.equal('DELIVERY_NOT_FOUND');
            expect(response.body.message).to.be.a('string');

        });

    });

});
