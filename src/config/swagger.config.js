
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
                'Incluye gestión de usuarios y productos, generación de mocks, ' +
                'manejo centralizado de errores y logging con Winston.'
        },
        servers: [
            {
                url: 'http://localhost:8080',
                description: 'Servidor local de desarrollo'
            }
        ],
        tags: [
            { name: 'Users', description: 'Gestión de usuarios' },
            { name: 'Orders', description: 'Gestión de pedidos' },
            { name: 'Deliveries', description: 'Gestión de entregas' },
            { name: 'Mocks', description: 'Generación de datos de prueba' },
            { name: 'Logger', description: 'Pruebas del sistema de logging' }
        ]
    },
apis: [path.join(__dirname, '../docs/*.yaml').replace(/\\/g, '/')]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
