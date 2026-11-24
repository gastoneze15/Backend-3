
import swaggerJSDoc from 'swagger-jsdoc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'ShipNow API',
            version: '1.0.0',
            description:
                'API desarrollada para Programación Backend III. ' +
                'ShipNow es un sistema de gestión de pedidos y entregas ' +
                'implementado mediante una arquitectura por capas. ' +
                'Incluye gestión de usuarios, pedidos y entregas, ' +
                'generación de datos de prueba mediante mocks, ' +
                'manejo centralizado de errores, logging con Winston, ' +
                'testing funcional automatizado con Mocha, Chai y Supertest, ' +
                'y gestión de archivos mediante Multer. ' +
                'Permite cargar documentos de usuarios, licencias de conducir ' +
                'y comprobantes de entrega mediante solicitudes multipart/form-data. ' +
                'Los archivos se almacenan físicamente en carpetas organizadas ' +
                'y sus metadatos se registran en MongoDB. ' +
                'Se aplican validaciones de formato, tamaño, tipo de documento ' +
                'y existencia de las entidades asociadas.'
        },
        servers: [
            {
                url: 'http://localhost:8080',
                description: 'Servidor local de desarrollo'
            }
        ],
        tags: [
            {
                name: 'Users',
                description: 'Gestión de usuarios, documentos y licencias de conducir'
            },
            {
                name: 'Orders',
                description: 'Gestión de pedidos'
            },
            {
                name: 'Deliveries',
                description: 'Gestión de entregas y carga de comprobantes'
            },
            {
                name: 'Mocks',
                description: 'Generación de datos de prueba'
            },
            {
                name: 'Logger',
                description: 'Pruebas del sistema de logging'
            }
        ]
    },
    apis: [
        path.join(__dirname, '../docs/*.yaml').replace(/\\/g, '/')
    ]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
