
import { expect } from 'chai';
import request from 'supertest';

import app from '../src/app.js';

describe('ShipNow API - Logger', function () {

    describe('GET /api/logger/test', function () {

        it('Debe ejecutar correctamente los niveles del logger', async function () {

            const response = await request(app)
                .get('/api/logger/test');

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal('success');

            expect(response.body.message).to.equal(
                'Prueba de logging ejecutada correctamente'
            );

            expect(response.body.levels).to.be.an('array');

            expect(response.body.levels).to.include.members([
                'debug',
                'http',
                'info',
                'warning',
                'error',
                'fatal'
            ]);

            expect(response.body.levels).to.have.lengthOf(6);
        });

        it('Debe devolver una respuesta con la estructura correcta', async function () {

            const response = await request(app)
                .get('/api/logger/test');

            expect(response.status).to.equal(200);

            expect(response.body).to.have.all.keys(
                'status',
                'message',
                'levels'
            );

            expect(response.body.status).to.be.a('string');
            expect(response.body.message).to.be.a('string');
            expect(response.body.levels).to.be.an('array');
        });

    });

});
