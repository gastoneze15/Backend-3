
import { expect } from 'chai';
import request from 'supertest';

import app from '../src/app.js';

import User from '../src/models/user.model.js';
import Order from '../src/models/order.model.js';
import Delivery from '../src/models/delivery.model.js';

import {
    connectTestDB,
    clearTestDB,
    disconnectTestDB
} from './helpers/testDb.js';

describe('ShipNow API - Mocks', function () {

    before(async function () {
        await connectTestDB();
        await clearTestDB();
    });

    after(async function () {
        await clearTestDB();
        await disconnectTestDB();
    });

    describe('GET /api/mocks/users', function () {

        it('Debe generar usuarios ficticios correctamente', async function () {
            const response = await request(app)
                .get('/api/mocks/users?quantity=5');

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal('success');
            expect(response.body.payload).to.be.an('array');
            expect(response.body.payload).to.have.lengthOf(5);

            const user = response.body.payload[0];

            expect(user).to.have.property('firstName');
            expect(user).to.have.property('lastName');
            expect(user).to.have.property('email');
            expect(user).to.not.have.property('password');
        });

        it('Debe rechazar una cantidad inválida de usuarios', async function () {
            const response = await request(app)
                .get('/api/mocks/users?quantity=-5');

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal('error');
            expect(response.body.code).to.equal('INVALID_MOCK_QUANTITY');
            expect(response.body.message).to.be.a('string');
        });

    });

    describe('GET /api/mocks/drivers', function () {

        it('Debe generar repartidores ficticios correctamente', async function () {
            const response = await request(app)
                .get('/api/mocks/drivers?quantity=3');

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal('success');
            expect(response.body.payload).to.be.an('array');
            expect(response.body.payload).to.have.lengthOf(3);

            const driver = response.body.payload[0];

            expect(driver).to.have.property('firstName');
            expect(driver).to.have.property('lastName');
            expect(driver).to.have.property('email');
            expect(driver).to.not.have.property('password');
        });

        it('Debe rechazar una cantidad inválida de repartidores', async function () {
            const response = await request(app)
                .get('/api/mocks/drivers?quantity=101');

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal('error');
            expect(response.body.code).to.equal('INVALID_MOCK_QUANTITY');
            expect(response.body.message).to.be.a('string');
        });

    });

    describe('POST /api/mocks/generate', function () {

        it('Debe generar y guardar datos ficticios en MongoDB', async function () {
            const response = await request(app)
                .post('/api/mocks/generate')
                .send({
                    customers: 2,
                    drivers: 2
                });

            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal('success');

            expect(response.body.payload.customers).to.equal(2);
            expect(response.body.payload.drivers).to.equal(2);
            expect(response.body.payload.orders).to.equal(2);
            expect(response.body.payload.deliveries).to.equal(2);

            const usersCount = await User.countDocuments();
            const ordersCount = await Order.countDocuments();
            const deliveriesCount = await Delivery.countDocuments();

            expect(usersCount).to.equal(4);
            expect(ordersCount).to.equal(2);
            expect(deliveriesCount).to.equal(2);

            const orders = await Order.find();

            for (const order of orders) {
                expect(order.delivery).to.not.equal(null);
            }
        });

        it('Debe rechazar una cantidad inválida al generar mocks', async function () {
            const response = await request(app)
                .post('/api/mocks/generate')
                .send({
                    customers: -1,
                    drivers: 2
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal('error');
            expect(response.body.code).to.equal('INVALID_MOCK_QUANTITY');
            expect(response.body.message).to.be.a('string');
        });

    });

});
