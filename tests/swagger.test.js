
import { expect } from 'chai';
import request from 'supertest';

import app from '../src/app.js';
import swaggerSpec from '../src/config/swagger.config.js';

// Resolver referencias a esquemas centralizados de OpenAPI
function resolveSchema(schema) {

    expect(schema).to.be.an('object');

    if (!schema.$ref) {
        return schema;
    }

    const reference = schema.$ref;

    expect(reference)
        .to.be.a('string')
        .and.to.match(/^#\/components\/schemas\//);

    const schemaName = reference.split('/').pop();

    expect(
        swaggerSpec.components.schemas,
        `No existe el esquema referenciado: ${schemaName}`
    ).to.have.property(schemaName);

    return swaggerSpec.components.schemas[schemaName];
}

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
                '/api/logger/test',
                '/api/users/{id}/documents',
                '/api/deliveries/{id}/proof'
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

            const schema = resolveSchema(
                patch.requestBody.content['application/json'].schema
            );

            const statusSchema = schema.properties.status;

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

    describe('Documentación de Multer', function () {

        it('Debe documentar POST /api/users/{id}/documents', function () {

            const endpoint =
                swaggerSpec.paths['/api/users/{id}/documents'];

            expect(endpoint).to.be.an('object');
            expect(endpoint).to.have.property('post');

            const post = endpoint.post;

            expect(post.requestBody.required)
                .to.equal(true);

            expect(post.requestBody.content)
                .to.have.property('multipart/form-data');

            const schema = resolveSchema(
                post.requestBody.content['multipart/form-data'].schema
            );

            expect(schema.type).to.equal('object');

            expect(schema.required)
                .to.include.members([
                    'file',
                    'documentType'
                ]);

            expect(schema.properties.file.type)
                .to.equal('string');

            expect(schema.properties.file.format)
                .to.equal('binary');

        });

        it('Debe documentar los tipos de documentos permitidos', function () {

            const post =
                swaggerSpec.paths['/api/users/{id}/documents'].post;

            const schema = resolveSchema(
                post.requestBody.content['multipart/form-data'].schema
            );

            const documentTypeSchema =
                schema.properties.documentType;

            expect(documentTypeSchema.type)
                .to.equal('string');

            expect(documentTypeSchema.enum)
                .to.have.members([
                    'user_document',
                    'driver_license'
                ]);

        });

        it('Debe documentar las respuestas de carga de documentos', function () {

            const post =
                swaggerSpec.paths['/api/users/{id}/documents'].post;

            const expectedResponses = [
                '201',
                '400',
                '404',
                '413',
                '415',
                '500'
            ];

            for (const status of expectedResponses) {

                expect(
                    post.responses,
                    `Falta documentar la respuesta ${status}`
                ).to.have.property(status);

            }

        });

        it('Debe documentar POST /api/deliveries/{id}/proof', function () {

            const endpoint =
                swaggerSpec.paths['/api/deliveries/{id}/proof'];

            expect(endpoint).to.be.an('object');
            expect(endpoint).to.have.property('post');

            const post = endpoint.post;

            expect(post.requestBody.required)
                .to.equal(true);

            expect(post.requestBody.content)
                .to.have.property('multipart/form-data');

            const schema = resolveSchema(
                post.requestBody.content['multipart/form-data'].schema
            );

            expect(schema.type).to.equal('object');

            expect(schema.required)
                .to.include('file');

            expect(schema.properties.file.type)
                .to.equal('string');

            expect(schema.properties.file.format)
                .to.equal('binary');

        });

        it('Debe documentar las respuestas de carga de comprobantes', function () {

            const post =
                swaggerSpec.paths['/api/deliveries/{id}/proof'].post;

            const expectedResponses = [
                '201',
                '400',
                '404',
                '409',
                '413',
                '415',
                '500'
            ];

            for (const status of expectedResponses) {

                expect(
                    post.responses,
                    `Falta documentar la respuesta ${status}`
                ).to.have.property(status);

            }

        });

        it('Debe documentar el esquema de metadatos de archivos', function () {

            expect(swaggerSpec.components)
                .to.be.an('object');

            expect(swaggerSpec.components.schemas)
                .to.have.property('FileMetadata');

            const schema =
                swaggerSpec.components.schemas.FileMetadata;

            expect(schema.type).to.equal('object');

            const expectedProperties = [
                'originalName',
                'fileName',
                'path',
                'mimeType',
                'size',
                'documentType',
                'uploadedAt'
            ];

            for (const property of expectedProperties) {

                expect(
                    schema.properties,
                    `Falta documentar el metadato ${property}`
                ).to.have.property(property);

            }

            expect(schema.required)
                .to.include.members(expectedProperties);

            expect(schema.properties.originalName.type)
                .to.equal('string');

            expect(schema.properties.fileName.type)
                .to.equal('string');

            expect(schema.properties.path.type)
                .to.equal('string');

            expect(schema.properties.mimeType.type)
                .to.equal('string');

            expect(schema.properties.mimeType.enum)
                .to.have.members([
                    'application/pdf',
                    'image/jpeg',
                    'image/png'
                ]);

            expect(schema.properties.size.type)
                .to.equal('integer');

            expect(schema.properties.size.minimum)
                .to.equal(1);

            expect(schema.properties.size.maximum)
                .to.equal(5242880);

            expect(schema.properties.documentType.type)
                .to.equal('string');

            expect(schema.properties.documentType.enum)
                .to.have.members([
                    'user_document',
                    'driver_license',
                    'delivery_proof'
                ]);

            expect(schema.properties.uploadedAt.type)
                .to.equal('string');

            expect(schema.properties.uploadedAt.format)
                .to.equal('date-time');

        });

    });

});
