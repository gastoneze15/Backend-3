
import { expect } from 'chai';
import request from 'supertest';

import app from '../src/app.js';

import {
    connectTestDB,
    clearTestDB,
    disconnectTestDB
} from './helpers/testDb.js';

describe('ShipNow API - Orders', function () {

    before(async function () {
        await connectTestDB();
        await clearTestDB();
    });

    after(async function () {
        await clearTestDB();
        await disconnectTestDB();
    });
describe('PATCH /api/orders/:id/status', () => {

        async function createTestOrder() {
            const userResponse = await request(app)
                .post('/api/users')
                .send({
                    firstName: 'Cliente',
                    lastName: 'Testing',
                    email: `cliente${Date.now()}${Math.random()}@test.com`,
                    password: '123456'
                });

            expect(userResponse.status).to.equal(201);

            const orderResponse = await request(app)
                .post('/api/orders')
                .send({
                    customer: userResponse.body.payload._id,
                    items: [
                        {
                            name: 'Producto de prueba',
                            quantity: 2,
                            price: 1500
                        }
                    ],
                    deliveryAddress: 'Av. Corrientes 1234'
                });

            expect(orderResponse.status).to.equal(201);

            return orderResponse.body.payload;
        }

        it('Debe actualizar correctamente el estado de un pedido', async () => {
            const order = await createTestOrder();

            const response = await request(app)
                .patch(`/api/orders/${order._id}/status`)
                .send({
                    status: 'assigned'
                });

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal('success');
            expect(response.body.payload.status).to.equal('assigned');

            const savedOrder = await request(app)
                .get(`/api/orders/${order._id}`);

            expect(savedOrder.status).to.equal(200);
            expect(savedOrder.body.payload.status).to.equal('assigned');
        });

        it('Debe rechazar un estado inválido', async () => {
            const order = await createTestOrder();

            const response = await request(app)
                .patch(`/api/orders/${order._id}/status`)
                .send({
                    status: 'estado_inventado'
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal('error');
            expect(response.body.code).to.equal('INVALID_ORDER_STATUS');
            expect(response.body.message).to.be.a('string');
        });

        it('Debe devolver 404 si el pedido no existe', async () => {
            const nonexistentId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .patch(`/api/orders/${nonexistentId}/status`)
                .send({
                    status: 'assigned'
                });

            expect(response.status).to.equal(404);
            expect(response.body.status).to.equal('error');
            expect(response.body.code).to.equal('ORDER_NOT_FOUND');
            expect(response.body.message).to.be.a('string');
        });

    });
    describe('GET /api/orders', function () {

        it('Debe obtener correctamente la lista de pedidos', async function () {

            const response = await request(app)
                .get('/api/orders');

            expect(response.status).to.equal(200);

            expect(response.body.status)
                .to.equal('success');

            expect(response.body)
                .to.have.property('payload');

            expect(response.body.payload)
                .to.be.an('array');

        });

    });

    describe('POST /api/orders', function () {

        it('Debe rechazar un pedido sin productos', async function () {

            const invalidOrder = {
                customer: '507f1f77bcf86cd799439011',
                items: [],
                deliveryAddress: 'Av. Corrientes 1234, CABA'
            };

            const response = await request(app)
                .post('/api/orders')
                .send(invalidOrder);

            expect(response.status).to.equal(400);

            expect(response.body.status)
                .to.equal('error');

            expect(response.body.code)
                .to.equal('INVALID_DATA');

            expect(response.body)
                .to.have.property('message');

            expect(response.body.message)
                .to.be.a('string');

        });

        it('Debe crear un pedido correctamente', async function () {

            const newUser = {
                firstName: 'Cliente',
                lastName: 'Pedidos',
                email: 'cliente.orders@shipnow.com',
                password: 'Test123456',
                role: 'customer'
            };

            const userResponse = await request(app)
                .post('/api/users')
                .send(newUser);

            expect(userResponse.status).to.equal(201);

            const customerId = userResponse.body.payload._id;

            const newOrder = {
                customer: customerId,
                items: [
                    {
                        name: 'Producto de prueba',
                        quantity: 2,
                        price: 1500
                    }
                ],
                deliveryAddress: 'Av. Corrientes 1234, CABA'
            };

            const response = await request(app)
                .post('/api/orders')
                .send(newOrder);

            expect(response.status).to.equal(201);

            expect(response.body.status)
                .to.equal('success');

            expect(response.body)
                .to.have.property('payload');

            expect(response.body.payload)
                .to.have.property('_id');

            expect(response.body.payload.items)
                .to.be.an('array');

            expect(response.body.payload.items)
                .to.have.lengthOf(1);

            expect(response.body.payload.total)
                .to.equal(3000);

            expect(response.body.payload.status)
                .to.equal('created');

            expect(response.body.payload.customer._id)
                .to.equal(customerId);

        });

    });

    describe('GET /api/orders/:id', function () {

        it('Debe devolver 400 si el ID del pedido es inválido', async function () {

            const invalidId = 'id-invalido';

            const response = await request(app)
                .get(`/api/orders/${invalidId}`);

            expect(response.status).to.equal(400);

            expect(response.body.status)
                .to.equal('error');

            expect(response.body.code)
                .to.equal('INVALID_ID');

            expect(response.body)
                .to.have.property('message');

            expect(response.body.message)
                .to.equal('El identificador proporcionado no es válido');

        });

        it('Debe devolver 404 si el pedido no existe', async function () {

            const nonexistentId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .get(`/api/orders/${nonexistentId}`);

            expect(response.status).to.equal(404);

            expect(response.body.status)
                .to.equal('error');

            expect(response.body.code)
                .to.equal('ORDER_NOT_FOUND');

            expect(response.body)
                .to.have.property('message');

            expect(response.body.message)
                .to.be.a('string');

        });

        it('Debe obtener un pedido existente por su ID', async function () {

            const userResponse = await request(app)
                .post('/api/users')
                .send({
                    firstName: 'Cliente',
                    lastName: 'Busqueda',
                    email: 'busqueda.orders@shipnow.com',
                    password: 'Test123456',
                    role: 'customer'
                });

            expect(userResponse.status).to.equal(201);

            const customerId = userResponse.body.payload._id;

            const orderResponse = await request(app)
                .post('/api/orders')
                .send({
                    customer: customerId,
                    items: [
                        {
                            name: 'Producto de búsqueda',
                            quantity: 1,
                            price: 2500
                        }
                    ],
                    deliveryAddress: 'Av. Santa Fe 1500, CABA'
                });

            expect(orderResponse.status).to.equal(201);

            const orderId = orderResponse.body.payload._id;

            const response = await request(app)
                .get(`/api/orders/${orderId}`);

            expect(response.status).to.equal(200);

            expect(response.body.status)
                .to.equal('success');

            expect(response.body)
                .to.have.property('payload');

            expect(response.body.payload._id)
                .to.equal(orderId);

            expect(response.body.payload.total)
                .to.equal(2500);

            expect(response.body.payload.customer._id)
                .to.equal(customerId);

        });

    });

});
