
import { expect } from 'chai';
import request from 'supertest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import app from '../src/app.js';
import Delivery from '../src/models/delivery.model.js';
import userRepository from '../src/repositories/user.repository.js';
import deliveryRepository from '../src/repositories/delivery.repository.js';

import {
    UPLOAD_ROOT,
    MAX_FILE_SIZE
} from '../src/config/multer.config.js';

import {
    connectTestDB,
    clearTestDB,
    disconnectTestDB
} from './helpers/testDb.js';

const validPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=',
    'base64'
);

const uploadFolders = [
    'documents',
    'licenses',
    'delivery-proofs'
];

async function clearTestUploads() {

    if (
        process.env.NODE_ENV !== 'test' ||
        path.basename(UPLOAD_ROOT) !== 'uploads-test'
    ) {
        throw new Error(
            'SEGURIDAD: Solo se pueden limpiar archivos de testing'
        );
    }

    for (const folder of uploadFolders) {

        const directory = path.join(UPLOAD_ROOT, folder);

        await fs.rm(directory, {
            recursive: true,
            force: true
        });

        await fs.mkdir(directory, {
            recursive: true
        });
    }
}

async function createTestUser() {

    const response = await request(app)
        .post('/api/users')
        .send({
            firstName: 'Usuario',
            lastName: 'Uploads Testing',
            email: `uploads-${randomUUID()}@shipnow.com`,
            password: 'Test123456',
            role: 'customer'
        });

    expect(response.status).to.equal(201);

    return response.body.payload._id;
}

async function createTestDelivery() {

    const userId = await createTestUser();

    const orderResponse = await request(app)
        .post('/api/orders')
        .send({
            customer: userId,
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

    const delivery = await Delivery.create({
        order: orderResponse.body.payload._id,
        status: 'pending',
        priority: 'normal'
    });

    return delivery._id.toString();
}

describe('ShipNow API - Uploads', function () {

    before(async function () {
        await connectTestDB();
        await clearTestDB();
        await clearTestUploads();
    });

    after(async function () {
        try {
            await clearTestUploads();
            await clearTestDB();
        } finally {
            await disconnectTestDB();
        }
    });

    describe('POST /api/users/:id/documents', function () {

        let userId;

        beforeEach(async function () {
            userId = await createTestUser();
        });

        it('Debe cargar un documento correctamente', async function () {

            const response = await request(app)
                .post(`/api/users/${userId}/documents`)
                .field('documentType', 'user_document')
                .attach('file', validPng, {
                    filename: 'documento.png',
                    contentType: 'image/png'
                });

            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal('success');

            expect(response.body.payload.documents)
                .to.be.an('array')
                .with.lengthOf(1);

            expect(response.body.payload)
                .not.to.have.property('password');

            const document =
                response.body.payload.documents[0];

            expect(document.originalName)
                .to.equal('documento.png');

            expect(document.mimeType)
                .to.equal('image/png');

            expect(document.documentType)
                .to.equal('user_document');

            expect(document.size)
                .to.equal(validPng.length);

            expect(document.fileName)
                .to.be.a('string');

            expect(document.uploadedAt)
                .to.be.a('string');

            expect(document.path)
                .to.equal(`documents/${document.fileName}`);

            const storedFile = await fs.readFile(
                path.join(UPLOAD_ROOT, document.path)
            );

            expect(storedFile.equals(validPng))
                .to.equal(true);

            const getResponse = await request(app)
                .get(`/api/users/${userId}`);

            expect(getResponse.status).to.equal(200);

            expect(getResponse.body.payload.documents)
                .to.deep.include(document);
        });

        it('Debe cargar una licencia de conducir correctamente', async function () {

            const response = await request(app)
                .post(`/api/users/${userId}/documents`)
                .field('documentType', 'driver_license')
                .attach('file', validPng, {
                    filename: 'licencia.png',
                    contentType: 'image/png'
                });

            expect(response.status).to.equal(201);

            const document =
                response.body.payload.documents[0];

            expect(document.documentType)
                .to.equal('driver_license');

            expect(document.path)
                .to.equal(`licenses/${document.fileName}`);

            const storedFile = await fs.readFile(
                path.join(UPLOAD_ROOT, document.path)
            );

            expect(storedFile.equals(validPng))
                .to.equal(true);
        });

        it('Debe rechazar una solicitud sin archivo', async function () {

            const response = await request(app)
                .post(`/api/users/${userId}/documents`)
                .field('documentType', 'user_document');

            expect(response.status).to.equal(400);
            expect(response.body.status).to.equal('error');
            expect(response.body.code).to.equal('FILE_REQUIRED');
        });

        it('Debe rechazar un tipo de documento inválido', async function () {

            const response = await request(app)
                .post(`/api/users/${userId}/documents`)
                .field('documentType', 'pasaporte')
                .attach('file', validPng, {
                    filename: 'documento.png',
                    contentType: 'image/png'
                });

            expect(response.status).to.equal(400);

            expect(response.body.code)
                .to.equal('INVALID_DOCUMENT_TYPE');
        });

        it('Debe rechazar la carga para un usuario inexistente', async function () {

            const nonexistentId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .post(`/api/users/${nonexistentId}/documents`)
                .field('documentType', 'user_document')
                .attach('file', validPng, {
                    filename: 'documento.png',
                    contentType: 'image/png'
                });

            expect(response.status).to.equal(404);

            expect(response.body.code)
                .to.equal('USER_NOT_FOUND');
        });

        it('Debe rechazar un formato de archivo no permitido', async function () {

            const response = await request(app)
                .post(`/api/users/${userId}/documents`)
                .field('documentType', 'user_document')
                .attach('file', Buffer.from('Archivo de texto'), {
                    filename: 'documento.txt',
                    contentType: 'text/plain'
                });

            expect(response.status).to.equal(415);

            expect(response.body.code)
                .to.equal('INVALID_FILE_TYPE');
        });

        it('Debe rechazar un archivo que supere los 5 MiB', async function () {

            const oversizedFile = Buffer.alloc(
                MAX_FILE_SIZE + 1
            );

            validPng.copy(oversizedFile);

            const response = await request(app)
                .post(`/api/users/${userId}/documents`)
                .field('documentType', 'user_document')
                .attach('file', oversizedFile, {
                    filename: 'archivo-grande.png',
                    contentType: 'image/png'
                });

            expect(response.status).to.equal(413);

            expect(response.body.code)
                .to.equal('FILE_TOO_LARGE');
        });

        it('Debe rechazar un nombre de campo incorrecto', async function () {

            const response = await request(app)
                .post(`/api/users/${userId}/documents`)
                .field('documentType', 'user_document')
                .attach('archivo', validPng, {
                    filename: 'documento.png',
                    contentType: 'image/png'
                });

            expect(response.status).to.equal(400);

            expect(response.body.code)
                .to.equal('INVALID_FILE_FIELD');
        });

        it('Debe rechazar un archivo disfrazado de PNG', async function () {

            const fakePng = Buffer.from(
                'Este archivo no es una imagen real'
            );

            const response = await request(app)
                .post(`/api/users/${userId}/documents`)
                .field('documentType', 'user_document')
                .attach('file', fakePng, {
                    filename: 'archivo-falso.png',
                    contentType: 'image/png'
                });

            expect(response.status).to.equal(415);

            expect(response.body.code)
                .to.equal('INVALID_FILE_TYPE');

            const getResponse = await request(app)
                .get(`/api/users/${userId}`);

            expect(getResponse.status).to.equal(200);

            expect(getResponse.body.payload.documents)
                .to.be.an('array')
                .that.is.empty;
        });

    });

    describe('POST /api/deliveries/:id/proof', function () {

        let deliveryId;

        beforeEach(async function () {
            deliveryId = await createTestDelivery();
        });

        it('Debe cargar un comprobante de entrega correctamente', async function () {

            const response = await request(app)
                .post(`/api/deliveries/${deliveryId}/proof`)
                .attach('file', validPng, {
                    filename: 'comprobante.png',
                    contentType: 'image/png'
                });

            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal('success');

            const proof = response.body.payload.proof;

            expect(proof).to.be.an('object');

            expect(proof.originalName)
                .to.equal('comprobante.png');

            expect(proof.documentType)
                .to.equal('delivery_proof');

            expect(proof.mimeType)
                .to.equal('image/png');

            expect(proof.size)
                .to.equal(validPng.length);

            expect(proof.fileName)
                .to.be.a('string');

            expect(proof.uploadedAt)
                .to.be.a('string');

            expect(proof.path)
                .to.equal(`delivery-proofs/${proof.fileName}`);

            const storedFile = await fs.readFile(
                path.join(UPLOAD_ROOT, proof.path)
            );

            expect(storedFile.equals(validPng))
                .to.equal(true);

            const getResponse = await request(app)
                .get(`/api/deliveries/${deliveryId}`);

            expect(getResponse.status).to.equal(200);

            expect(getResponse.body.payload.proof)
                .to.deep.equal(proof);
        });

        it('Debe rechazar un comprobante duplicado', async function () {

            const firstResponse = await request(app)
                .post(`/api/deliveries/${deliveryId}/proof`)
                .attach('file', validPng, {
                    filename: 'primer-comprobante.png',
                    contentType: 'image/png'
                });

            expect(firstResponse.status).to.equal(201);

            const originalProof =
                firstResponse.body.payload.proof;

            const directory = path.join(
                UPLOAD_ROOT,
                'delivery-proofs'
            );

            const filesBefore = await fs.readdir(directory);

            const secondResponse = await request(app)
                .post(`/api/deliveries/${deliveryId}/proof`)
                .attach('file', validPng, {
                    filename: 'segundo-comprobante.png',
                    contentType: 'image/png'
                });

            expect(secondResponse.status).to.equal(409);

            expect(secondResponse.body.code)
                .to.equal('PROOF_ALREADY_EXISTS');

            const filesAfter = await fs.readdir(directory);

            expect(filesAfter.sort())
                .to.deep.equal(filesBefore.sort());

            const getResponse = await request(app)
                .get(`/api/deliveries/${deliveryId}`);

            expect(getResponse.status).to.equal(200);

            expect(getResponse.body.payload.proof)
                .to.deep.equal(originalProof);
        });

        it('Debe rechazar un comprobante para una entrega inexistente', async function () {

            const nonexistentId = '507f1f77bcf86cd799439011';

            const directory = path.join(
                UPLOAD_ROOT,
                'delivery-proofs'
            );

            const filesBefore = await fs.readdir(directory);

            const response = await request(app)
                .post(`/api/deliveries/${nonexistentId}/proof`)
                .attach('file', validPng, {
                    filename: 'comprobante.png',
                    contentType: 'image/png'
                });

            expect(response.status).to.equal(404);

            expect(response.body.code)
                .to.equal('DELIVERY_NOT_FOUND');

            const filesAfter = await fs.readdir(directory);

            expect(filesAfter.sort())
                .to.deep.equal(filesBefore.sort());
        });

        it('Debe rechazar un identificador de entrega inválido', async function () {

            const response = await request(app)
                .post('/api/deliveries/id-invalido/proof')
                .attach('file', validPng, {
                    filename: 'comprobante.png',
                    contentType: 'image/png'
                });

            expect(response.status).to.equal(400);

            expect(response.body.code)
                .to.equal('INVALID_ID');
        });

        it('Debe rechazar una solicitud sin comprobante', async function () {

            const response = await request(app)
                .post(`/api/deliveries/${deliveryId}/proof`)
                .field('test', 'sin-archivo');

            expect(response.status).to.equal(400);

            expect(response.body.code)
                .to.equal('FILE_REQUIRED');
        });

        it('Debe rechazar un comprobante disfrazado de PNG', async function () {

            const fakePng = Buffer.from(
                'Este comprobante no es una imagen real'
            );

            const directory = path.join(
                UPLOAD_ROOT,
                'delivery-proofs'
            );

            const filesBefore = await fs.readdir(directory);

            const response = await request(app)
                .post(`/api/deliveries/${deliveryId}/proof`)
                .attach('file', fakePng, {
                    filename: 'comprobante-falso.png',
                    contentType: 'image/png'
                });

            expect(response.status).to.equal(415);

            expect(response.body.code)
                .to.equal('INVALID_FILE_TYPE');

            const filesAfter = await fs.readdir(directory);

            expect(filesAfter.sort())
                .to.deep.equal(filesBefore.sort());

            const getResponse = await request(app)
                .get(`/api/deliveries/${deliveryId}`);

            expect(getResponse.status).to.equal(200);

            expect(getResponse.body.payload.proof)
                .to.equal(null);
        });

    });
    describe('Formatos de archivos permitidos', function () {

        const validJpeg = Buffer.from(
            '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAx' +
            'NDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy' +
            'MjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUF' +
            'BAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVW' +
            'V1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi' +
            '4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAEC' +
            'AxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVm' +
            'Z2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq' +
            '8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==',
            'base64'
        );

        const validPdf = Buffer.from(
            'JVBERi0xLjMKJZOMi54gUmVwb3J0TGFiIEdlbmVyYXRlZCBQREYgZG9jdW1lbnQgKG9wZW5zb3VyY2UpCjEgMCBvYmoKPDwKL0Yx' +
            'IDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9CYXNlRm9udCAvSGVsdmV0aWNhIC9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5n' +
            'IC9OYW1lIC9GMSAvU3VidHlwZSAvVHlwZTEgL1R5cGUgL0ZvbnQKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL0NvbnRlbnRzIDcgMCBS' +
            'IC9NZWRpYUJveCBbIDAgMCAxMDAgMTAwIF0gL1BhcmVudCA2IDAgUiAvUmVzb3VyY2VzIDw8Ci9Gb250IDEgMCBSIC9Qcm9jU2V0' +
            'IFsgL1BERiAvVGV4dCAvSW1hZ2VCIC9JbWFnZUMgL0ltYWdlSSBdCj4+IC9Sb3RhdGUgMCAvVHJhbnMgPDwKCj4+IAogIC9UeXBl' +
            'IC9QYWdlCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9QYWdlTW9kZSAvVXNlTm9uZSAvUGFnZXMgNiAwIFIgL1R5cGUgL0NhdGFsb2cK' +
            'Pj4KZW5kb2JqCjUgMCBvYmoKPDwKL0F1dGhvciAoYW5vbnltb3VzKSAvQ3JlYXRpb25EYXRlIChEOjIwMDAwMTAxMDAwMDAwKzAw' +
            'JzAwJykgL0NyZWF0b3IgKGFub255bW91cykgL0tleXdvcmRzICgpIC9Nb2REYXRlIChEOjIwMDAwMTAxMDAwMDAwKzAwJzAwJykg' +
            'L1Byb2R1Y2VyIChSZXBvcnRMYWIgUERGIExpYnJhcnkgLSBcKG9wZW5zb3VyY2VcKSkgCiAgL1N1YmplY3QgKHVuc3BlY2lmaWVk' +
            'KSAvVGl0bGUgKHVudGl0bGVkKSAvVHJhcHBlZCAvRmFsc2UKPj4KZW5kb2JqCjYgMCBvYmoKPDwKL0NvdW50IDEgL0tpZHMgWyAz' +
            'IDAgUiBdIC9UeXBlIC9QYWdlcwo+PgplbmRvYmoKNyAwIG9iago8PAovRmlsdGVyIFsgL0FTQ0lJODVEZWNvZGUgL0ZsYXRlRGVj' +
            'b2RlIF0gL0xlbmd0aCA5NAo+PgpzdHJlYW0KR2FwUWgwRT1GLDBVXEgzVFxwTllUXlFLaz90Yz5JUCw7VyNVMV4yM2loUEVNXz9D' +
            'VzRLSVNpOTpiWGInI2ckKW4jWT9VI2Q4VUNuO0AoWU9XRFZSVCEsa21MOkJ+PmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDgKMDAw' +
            'MDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDYxIDAwMDAwIG4gCjAwMDAwMDAwOTIgMDAwMDAgbiAKMDAwMDAwMDE5OSAwMDAwMCBu' +
            'IAowMDAwMDAwMzkyIDAwMDAwIG4gCjAwMDAwMDA0NjAgMDAwMDAgbiAKMDAwMDAwMDcyMSAwMDAwMCBuIAowMDAwMDAwNzgwIDAw' +
            'MDAwIG4gCnRyYWlsZXIKPDwKL0lEIApbPDFjMTc4MTk4ZmJkZmE1MWIyNTk5NWQ4OWQ0MTAyMDQzPjwxYzE3ODE5OGZiZGZhNTFi' +
            'MjU5OTVkODlkNDEwMjA0Mz5dCiUgUmVwb3J0TGFiIGdlbmVyYXRlZCBQREYgZG9jdW1lbnQgLS0gZGlnZXN0IChvcGVuc291cmNl' +
            'KQoKL0luZm8gNSAwIFIKL1Jvb3QgNCAwIFIKL1NpemUgOAo+PgpzdGFydHhyZWYKOTYzCiUlRU9GCg==',
            'base64'
        );

        const formats = [
            {
                extension: '.jpg',
                mimeType: 'image/jpeg',
                buffer: validJpeg
            },
            {
                extension: '.jpeg',
                mimeType: 'image/jpeg',
                buffer: validJpeg
            },
            {
                extension: '.pdf',
                mimeType: 'application/pdf',
                buffer: validPdf
            }
        ];

        for (const format of formats) {

            it(`Debe cargar correctamente un archivo ${format.extension}`, async function () {

                const userId = await createTestUser();

                const filename = `documento${format.extension}`;

                const response = await request(app)
                    .post(`/api/users/${userId}/documents`)
                    .field('documentType', 'user_document')
                    .attach('file', format.buffer, {
                        filename,
                        contentType: format.mimeType
                    });

                expect(response.status).to.equal(201);

                expect(response.body.status)
                    .to.equal('success');

                const document =
                    response.body.payload.documents[0];

                expect(document.originalName)
                    .to.equal(filename);

                expect(document.mimeType)
                    .to.equal(format.mimeType);

                expect(document.documentType)
                    .to.equal('user_document');

                expect(document.size)
                    .to.equal(format.buffer.length);

                expect(path.extname(document.fileName))
                    .to.equal(format.extension);

                expect(document.path)
                    .to.equal(`documents/${document.fileName}`);

                const storedFile = await fs.readFile(
                    path.join(UPLOAD_ROOT, document.path)
                );

                expect(storedFile.equals(format.buffer))
                    .to.equal(true);

                const getResponse = await request(app)
                    .get(`/api/users/${userId}`);

                expect(getResponse.status).to.equal(200);

                expect(getResponse.body.payload.documents)
                    .to.deep.include(document);

            });

        }

    });

    describe('Limpieza de archivos ante errores internos', function () {

        it('Debe eliminar el documento si falla su asociación con el usuario', async function () {

            const userId = await createTestUser();

            // Cargar un documento previo para comprobar que se conserva
            const firstResponse = await request(app)
                .post(`/api/users/${userId}/documents`)
                .field('documentType', 'user_document')
                .attach('file', validPng, {
                    filename: 'documento-original.png',
                    contentType: 'image/png'
                });

            expect(firstResponse.status).to.equal(201);

            const originalDocuments =
                firstResponse.body.payload.documents;

            const directory = path.join(
                UPLOAD_ROOT,
                'documents'
            );

            const filesBefore = await fs.readdir(directory);

            const originalAddDocument =
                userRepository.addDocument;

            let repositoryCalled = false;
            let storedFileVerified = false;
            let response;

            try {

                // Simular un fallo después de guardar el archivo
                userRepository.addDocument = async (id, metadata) => {

                    repositoryCalled = true;

                    const storedFile = await fs.readFile(
                        path.join(UPLOAD_ROOT, metadata.path)
                    );

                    storedFileVerified =
                        storedFile.equals(validPng);

                    throw new Error(
                        'Error simulado de MongoDB al asociar documento'
                    );
                };

                response = await request(app)
                    .post(`/api/users/${userId}/documents`)
                    .field('documentType', 'user_document')
                    .attach('file', validPng, {
                        filename: 'documento-error.png',
                        contentType: 'image/png'
                    });

            } finally {

                // Restaurar siempre el método original
                userRepository.addDocument =
                    originalAddDocument;
            }

            expect(repositoryCalled).to.equal(true);
            expect(storedFileVerified).to.equal(true);

            expect(response.status).to.equal(500);

            expect(response.body.status)
                .to.equal('error');

            expect(response.body.code)
                .to.equal('INTERNAL_ERROR');

            // Comprobar que no quedaron archivos huérfanos
            const filesAfter = await fs.readdir(directory);

            expect(filesAfter.sort())
                .to.deep.equal(filesBefore.sort());

            // Comprobar que los documentos anteriores se conservan
            const getResponse = await request(app)
                .get(`/api/users/${userId}`);

            expect(getResponse.status).to.equal(200);

            expect(getResponse.body.payload.documents)
                .to.deep.equal(originalDocuments);

            const originalFile = await fs.readFile(
                path.join(
                    UPLOAD_ROOT,
                    originalDocuments[0].path
                )
            );

            expect(originalFile.equals(validPng))
                .to.equal(true);

        });

        it('Debe eliminar el comprobante si falla su asociación con la entrega', async function () {

            const deliveryId = await createTestDelivery();

            const directory = path.join(
                UPLOAD_ROOT,
                'delivery-proofs'
            );

            const filesBefore = await fs.readdir(directory);

            const originalAddProof =
                deliveryRepository.addProof;

            let repositoryCalled = false;
            let storedFileVerified = false;
            let response;

            try {

                deliveryRepository.addProof = async (id, metadata) => {

                    repositoryCalled = true;

                    const storedFile = await fs.readFile(
                        path.join(UPLOAD_ROOT, metadata.path)
                    );

                    storedFileVerified =
                        storedFile.equals(validPng);

                    throw new Error(
                        'Error simulado de MongoDB al asociar comprobante'
                    );
                };

                response = await request(app)
                    .post(`/api/deliveries/${deliveryId}/proof`)
                    .attach('file', validPng, {
                        filename: 'comprobante-error.png',
                        contentType: 'image/png'
                    });

            } finally {

                deliveryRepository.addProof =
                    originalAddProof;
            }

            expect(repositoryCalled).to.equal(true);
            expect(storedFileVerified).to.equal(true);

            expect(response.status).to.equal(500);

            expect(response.body.status)
                .to.equal('error');

            expect(response.body.code)
                .to.equal('INTERNAL_ERROR');

            const filesAfter = await fs.readdir(directory);

            expect(filesAfter.sort())
                .to.deep.equal(filesBefore.sort());

            const getResponse = await request(app)
                .get(`/api/deliveries/${deliveryId}`);

            expect(getResponse.status).to.equal(200);

            expect(getResponse.body.payload.proof)
                .to.equal(null);

        });

    });


});
