
import { expect } from 'chai';
import request from 'supertest';

import app from '../src/app.js';
import swaggerSpec from '../src/config/swagger.config.js';

describe('ShipNow API - Swagger', function () {

    describe('GET /api/docs', function () {

        it('Debe permitir acceder a Swagger UI', async function () {
            const response = await request(app)
                .get('/api/docs/')
                .redirects(0);

            expect(response.status).to.equal(200);
            expect(response.headers['content-type'])
                .to.include('text/html');
            expect(response.text).to.include('Swagger UI');
        });

    });

    describe('Configuración OpenAPI', function () {

        it('Debe tener una especificación OpenAPI válida', function () {
            expect(swaggerSpec).to.be.an('object');
            expect(swaggerSpec.openapi).to.match(/^3\./);
            expect(swaggerSpec.info).to.be.an('object');
            expect(swaggerSpec.info.title).to.be.a('string');
            expect(swaggerSpec.info.version).to.be.a('string');
            expect(swaggerSpec.paths).to.be.an('object');
        });

        it('Debe documentar los endpoints principales', function () {
            const requiredPaths = [
                '/api/users',
                '/api/orders',
                '/api/orders/{id}',
                '/api/deliveries',
                '/api/deliveries/{id}',
                '/api/mocks/users',
                '/api/mocks/drivers',
                '/api/mocks/generate',
                '/api/logger/test'
            ];

            for (const path of requiredPaths) {
                expect(
                    swaggerSpec.paths,
                    `Falta documentar: ${path}`
                ).to.have.property(path);
            }
        });

        it('Debe documentar POST /api/orders', function () {
            const endpoint = swaggerSpec.paths['/api/orders'];

            expect(endpoint).to.have.property('post');

            expect(endpoint.post.requestBody.required)
                .to.equal(true);

            expect(endpoint.post.responses)
                .to.have.property('201');

            expect(endpoint.post.responses)
                .to.have.property('400');
        });

        it('Debe documentar PATCH /api/orders/{id}/status', function () {
            const endpoint =
                swaggerSpec.paths['/api/orders/{id}/status'];

            expect(endpoint).to.be.an('object');
            expect(endpoint).to.have.property('patch');

            const patch = endpoint.patch;

            expect(patch.parameters).to.be.an('array');

            expect(patch.requestBody.required)
                .to.equal(true);

            expect(patch.responses).to.have.property('200');
            expect(patch.responses).to.have.property('400');
            expect(patch.responses).to.have.property('404');
        });

        it('Debe documentar los estados permitidos', function () {
            const patch =
                swaggerSpec.paths['/api/orders/{id}/status'].patch;

            const statusSchema =
                patch.requestBody.content['application/json']
                    .schema.properties.status;

            expect(statusSchema.enum).to.have.members([
                'created',
                'assigned',
                'picked_up',
                'in_transit',
                'delivered',
                'cancelled'
            ]);
        });

    });

});
