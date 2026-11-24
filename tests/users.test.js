
import { expect } from 'chai';
import request from 'supertest';

import app from '../src/app.js';

import {
    connectTestDB,
    clearTestDB,
    disconnectTestDB
} from './helpers/testDb.js';

describe('ShipNow API - Users', function () {

    before(async function () {
        await connectTestDB();
        await clearTestDB();
    });

    after(async function () {
        await clearTestDB();
        await disconnectTestDB();
    });

    describe('GET /api/users', function () {

        it('Debe obtener correctamente la lista de usuarios', async function () {

            const response = await request(app)
                .get('/api/users');

            expect(response.status).to.equal(200);

            expect(response.body).to.have.property(
                'status',
                'success'
            );

            expect(response.body).to.have.property('payload');

            expect(response.body.payload).to.be.an('array');

        });

    });

    describe('POST /api/users', function () {

        it('Debe rechazar un usuario sin email', async function () {

            const invalidUser = {
                firstName: 'Usuario',
                lastName: 'Sin Email',
                password: 'Test123456',
                role: 'customer'
            };

            const response = await request(app)
                .post('/api/users')
                .send(invalidUser);

            expect(response.status).to.equal(400);

            expect(response.body.status).to.equal('error');

            expect(response.body).to.have.property('code');

            expect(response.body).to.have.property('message');

            expect(response.body.message).to.be.a('string');

        });

        it('Debe crear un usuario correctamente', async function () {

            const newUser = {
                firstName: 'Usuario',
                lastName: 'Testing',
                email: 'usuario.testing@shipnow.com',
                password: 'Test123456',
                role: 'customer'
            };

            const response = await request(app)
                .post('/api/users')
                .send(newUser);

            expect(response.status).to.equal(201);

            expect(response.body.status).to.equal('success');

            expect(response.body).to.have.property('payload');

            expect(response.body.payload.firstName)
                .to.equal(newUser.firstName);

            expect(response.body.payload.email)
                .to.equal(newUser.email);

            expect(response.body.payload)
                .to.have.property('_id');

        });

    });

    describe('GET /api/users/:id', function () {

        it('Debe devolver 404 si el usuario no existe', async function () {

            const nonexistentId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .get(`/api/users/${nonexistentId}`);

            expect(response.status).to.equal(404);

            expect(response.body.status).to.equal('error');

            expect(response.body).to.have.property('code');

            expect(response.body).to.have.property('message');

            expect(response.body.message).to.be.a('string');

        });

        it('Debe obtener un usuario existente por su ID', async function () {

            const newUser = {
                firstName: 'Usuario',
                lastName: 'Busqueda',
                email: 'busqueda.testing@shipnow.com',
                password: 'Test123456',
                role: 'customer'
            };

            
            const createResponse = await request(app)
                .post('/api/users')
                .send(newUser);

            expect(createResponse.status).to.equal(201);

            const userId = createResponse.body.payload._id;

            const response = await request(app)
                .get(`/api/users/${userId}`);

            expect(response.status).to.equal(200);

            expect(response.body.status).to.equal('success');

            expect(response.body).to.have.property('payload');

            expect(response.body.payload._id).to.equal(userId);

            expect(response.body.payload.email)
                .to.equal(newUser.email);

        });

    });

    describe('PUT /api/users/:id', function () {

        it('Debe devolver 404 al actualizar un usuario inexistente', async function () {

            const nonexistentId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .put(`/api/users/${nonexistentId}`)
                .send({
                    lastName: 'Actualizado'
                });

            expect(response.status).to.equal(404);

            expect(response.body.status).to.equal('error');

            expect(response.body).to.have.property('code');

            expect(response.body).to.have.property('message');

            expect(response.body.message).to.be.a('string');

        });

        it('Debe actualizar correctamente un usuario', async function () {

            const newUser = {
                firstName: 'Usuario',
                lastName: 'Original',
                email: 'actualizacion.testing@shipnow.com',
                password: 'Test123456',
                role: 'customer'
            };

            const createResponse = await request(app)
                .post('/api/users')
                .send(newUser);

            expect(createResponse.status).to.equal(201);

            const userId = createResponse.body.payload._id;

            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({
                    lastName: 'Actualizado'
                });

            expect(response.status).to.equal(200);

            expect(response.body.status).to.equal('success');

            expect(response.body).to.have.property('payload');


            const getResponse = await request(app)
                .get(`/api/users/${userId}`);

            expect(getResponse.status).to.equal(200);

            expect(getResponse.body.payload.lastName)
                .to.equal('Actualizado');

        });

    });

    describe('DELETE /api/users/:id', function () {

        it('Debe devolver 404 al eliminar un usuario inexistente', async function () {

            const nonexistentId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .delete(`/api/users/${nonexistentId}`);

            expect(response.status).to.equal(404);

            expect(response.body.status).to.equal('error');

            expect(response.body).to.have.property('code');

            expect(response.body).to.have.property('message');

            expect(response.body.message).to.be.a('string');

        });

        it('Debe eliminar correctamente un usuario', async function () {

            const newUser = {
                firstName: 'Usuario',
                lastName: 'Eliminar',
                email: 'eliminar.testing@shipnow.com',
                password: 'Test123456',
                role: 'customer'
            };

            const createResponse = await request(app)
                .post('/api/users')
                .send(newUser);

            expect(createResponse.status).to.equal(201);

            const userId = createResponse.body.payload._id;

            const deleteResponse = await request(app)
                .delete(`/api/users/${userId}`);

            expect(deleteResponse.status).to.equal(200);

            expect(deleteResponse.body.status)
                .to.equal('success');

            expect(deleteResponse.body)
                .to.have.property('payload');

            const getResponse = await request(app)
                .get(`/api/users/${userId}`);

            expect(getResponse.status).to.equal(404);

            expect(getResponse.body.status)
                .to.equal('error');

        });

    });

});
