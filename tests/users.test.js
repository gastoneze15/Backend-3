
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

    describe('Seguridad de usuarios', function () {

        let userId;

        const createUser = async function () {

            const response = await request(app)
                .post('/api/users')
                .send({
                    firstName: 'Usuario',
                    lastName: 'Security Test',
                    email: `security-${Date.now()}-${Math.random()}@shipnow.com`,
                    password: 'Test123456',
                    role: 'customer'
                });

            expect(response.status).to.equal(201);

            return response.body.payload;
        };

        beforeEach(async function () {

            const user = await createUser();

            userId = user._id;

        });

        it('No debe exponer la contraseña al crear un usuario', async function () {

            const user = await createUser();

            expect(user)
                .not.to.have.property('password');

        });

        it('No debe exponer contraseñas en la lista de usuarios', async function () {

            const response = await request(app)
                .get('/api/users');

            expect(response.status).to.equal(200);

            expect(response.body.payload)
                .to.be.an('array')
                .that.is.not.empty;

            for (const user of response.body.payload) {

                expect(user)
                    .not.to.have.property('password');

            }

        });

        it('No debe exponer la contraseña al consultar un usuario por ID', async function () {

            const response = await request(app)
                .get(`/api/users/${userId}`);

            expect(response.status).to.equal(200);

            expect(response.body.payload)
                .not.to.have.property('password');

        });

        it('No debe exponer la contraseña al actualizar un usuario', async function () {

            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({
                    lastName: 'Actualizado'
                });

            expect(response.status).to.equal(200);

            expect(response.body.payload)
                .not.to.have.property('password');

        });

        it('Debe impedir la modificación directa de documentos', async function () {

            const originalResponse = await request(app)
                .get(`/api/users/${userId}`);

            expect(originalResponse.status).to.equal(200);

            const originalDocuments =
                originalResponse.body.payload.documents;

            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({
                    documents: []
                });

            expect(response.status).to.equal(400);

            expect(response.body.code)
                .to.equal('INVALID_USER_DATA');

            const getResponse = await request(app)
                .get(`/api/users/${userId}`);

            expect(getResponse.status).to.equal(200);

            expect(getResponse.body.payload.documents)
                .to.deep.equal(originalDocuments);

        });

        it('Debe impedir la creación de administradores', async function () {

            const response = await request(app)
                .post('/api/users')
                .send({
                    firstName: 'Admin',
                    lastName: 'Testing',
                    email: 'admin-security@shipnow.com',
                    password: 'Test123456',
                    role: 'admin'
                });

            expect(response.status).to.equal(400);

            expect(response.body.code)
                .to.equal('ADMIN_CREATION_FORBIDDEN');

        });

        it('Debe impedir la asignación del rol administrador mediante PUT', async function () {

            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({
                    role: 'admin'
                });

            expect(response.status).to.equal(400);

            expect(response.body.code)
                .to.equal('ADMIN_CREATION_FORBIDDEN');

            const getResponse = await request(app)
                .get(`/api/users/${userId}`);

            expect(getResponse.status).to.equal(200);

            expect(getResponse.body.payload.role)
                .to.equal('customer');

        });

        it('Debe rechazar un rol de usuario inválido', async function () {

            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({
                    role: 'rol_invalido'
                });

            expect(response.status).to.equal(400);

            expect(response.body.code)
                .to.equal('INVALID_DATA');

            const getResponse = await request(app)
                .get(`/api/users/${userId}`);

            expect(getResponse.status).to.equal(200);

            expect(getResponse.body.payload.role)
                .to.equal('customer');

        });

    });

});
