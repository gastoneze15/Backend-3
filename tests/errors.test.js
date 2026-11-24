
import { expect } from 'chai';
import request from 'supertest';

import app from '../src/app.js';

describe('ShipNow API - Manejo de errores', function () {

    describe('Rutas inexistentes', function () {

        it('Debe devolver 404 cuando la ruta no existe', async function () {

            const response = await request(app)
                .get('/api/ruta-inexistente');

            expect(response.status).to.equal(404);
            expect(response.body.status).to.equal('error');
            expect(response.body.code).to.equal('ROUTE_NOT_FOUND');
            expect(response.body.message).to.be.a('string');

        });

        it('Debe devolver la estructura correcta del error', async function () {

            const response = await request(app)
                .get('/api/otra-ruta-inexistente');

            expect(response.status).to.equal(404);

            expect(response.body).to.have.all.keys(
                'status',
                'code',
                'message'
            );

            expect(response.body.status).to.equal('error');
            expect(response.body.code).to.be.a('string');
            expect(response.body.message).to.be.a('string');

        });

    });

    describe('Validación de identificadores', function () {

        it('Debe devolver 400 cuando el ID de un pedido es inválido', async function () {

            const response = await request(app)
                .get('/api/orders/id-invalido');

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal('error');
            expect(response.body.code).to.equal('INVALID_ID');
            expect(response.body.message).to.be.a('string');

        });

        it('Debe devolver 400 cuando el ID de una entrega es inválido', async function () {

            const response = await request(app)
                .get('/api/deliveries/id-invalido');

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal('error');
            expect(response.body.code).to.equal('INVALID_ID');
            expect(response.body.message).to.be.a('string');

        });

    });

    describe('Validación de datos', function () {

        it('Debe devolver 400 cuando se crea un pedido sin productos', async function () {

            const response = await request(app)
                .post('/api/orders')
                .send({
                    customer: '507f1f77bcf86cd799439011',
                    items: [],
                    deliveryAddress: 'Av. Corrientes 1234'
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal('error');
            expect(response.body.code).to.equal('INVALID_DATA');
            expect(response.body.message).to.be.a('string');

        });

        it('Debe devolver 400 cuando se envía un estado inválido', async function () {

            const response = await request(app)
                .patch('/api/orders/507f1f77bcf86cd799439011/status')
                .send({
                    status: 'estado_incorrecto'
                });

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal('error');
            expect(response.body.code).to.equal('INVALID_ORDER_STATUS');
            expect(response.body.message).to.be.a('string');

        });

    });

});
