ShipNow API
Pre-entregas de los Módulos 1, 2, 3 y 4 de Programación Backend III.

ShipNow API es una aplicación desarrollada con Node.js, Express y MongoDB para la gestión de usuarios, productos y la generación de datos de prueba relacionados con pedidos y entregas.

El proyecto incorpora una arquitectura por capas, un módulo de mocking, un sistema centralizado de manejo de errores y logging profesional con Winston.
Tecnologías utilizadas
- Node.js
- JavaScript (ES Modules)
- Express
- MongoDB
- Mongoose
- dotenv
- CORS
- Nodemon
- @faker-js/faker
- bcryptjs
- Winston
- winston-daily-rotate-file
Arquitectura
El proyecto utiliza una arquitectura por capas:

Router

  ↓

Controller

  ↓

Service

  ↓

Repository

  ↓

Model

  ↓

MongoDB

Controller
Los Controllers reciben las peticiones HTTP, llaman al Service correspondiente y devuelven las respuestas exitosas.

No realizan consultas directas a MongoDB.

Los errores se derivan al middleware global mediante next(error).
Service
Los Services contienen la lógica de negocio.

Sus responsabilidades incluyen:
- Validar usuarios y productos.
- Evitar la creación de administradores desde el endpoint público.
- Detectar registros inexistentes o duplicados.
- Determinar el estado de productos según su stock.
- Calcular costos de envío.
- Validar cantidades de mocks.
- Generar y relacionar datos simulados.
- Lanzar errores personalizados cuando corresponde.
Repository
Los Repositories centralizan el acceso a MongoDB mediante Mongoose.

Contienen operaciones como find, findById, findOne, create, findByIdAndUpdate y findByIdAndDelete.

Esta separación permite mantener desacoplada la lógica de negocio del acceso a los datos.
Instalación
Clonar el repositorio:

git clone https://github.com/gastoneze15/Backend-3.git

Ingresar a la carpeta del proyecto:

cd Backend-3

Instalar las dependencias:

npm install

Es necesario tener Node.js y MongoDB instalados.
Variables de entorno
La configuración se centraliza en:

src/config/env.config.js

Crear un archivo .env en la raíz del proyecto tomando como referencia .env.example.

Ejemplo para desarrollo:

PORT=8080

MONGODB_URI=mongodb://localhost:27017/shipnow

NODE_ENV=development

Para probar los mocks se recomienda utilizar una base de datos independiente:

PORT=8080

MONGODB_URI=mongodb://localhost:27017/shipnow_mocks

NODE_ENV=development

Esto permite realizar pruebas sin modificar los registros de la base original.

El archivo .env no se incluye en el repositorio por seguridad.
Ejecución
Asegurarse de que MongoDB esté ejecutándose.

Iniciar el servidor:

npm start

También puede utilizarse:

node src/server.js

La API estará disponible en:

http://localhost:8080

Módulo 1: Arquitectura por capas
En el primer módulo se reorganizó ShipNow API utilizando las capas Controller, Service y Repository.

Se implementaron operaciones de usuarios y productos, validaciones y constantes para evitar valores escritos directamente en el código.
Endpoints principales
| Método | Ruta | Descripción |

|---|---|---|

| GET | /api/health | Verificar el estado de la API |

| GET | /api/users | Listar usuarios |

| GET | /api/users/:id | Obtener usuario por ID |

| POST | /api/users | Crear usuario |

| PUT | /api/users/:id | Actualizar usuario |

| DELETE | /api/users/:id | Eliminar usuario |

| GET | /api/products | Listar productos disponibles |

| GET | /api/products?all=true | Listar todos los productos |

| GET | /api/products/:id | Obtener producto por ID |

| POST | /api/products | Crear producto |

| PUT | /api/products/:id | Actualizar producto |

| DELETE | /api/products/:id | Eliminar producto |

| GET | /api/products/:id/shipping-cost | Calcular el costo de envío |
Constantes
Las constantes se encuentran centralizadas en:

src/constants/index.js

Se utilizan para representar roles de usuario, estados de productos, estados de pedidos, estados de entregas y prioridades.
Módulo 2: Generación de Mocks
Se incorporó un módulo para generar datos ficticios de clientes, repartidores, pedidos y entregas.

La implementación utiliza @faker-js/faker para generar información simulada y bcryptjs para almacenar las contraseñas mediante hashes.

El módulo respeta los modelos reales y la arquitectura por capas.
Endpoints de mocks
| Método | Ruta | Descripción |

|---|---|---|

| GET | /api/mocks/users | Generar clientes ficticios sin guardarlos |

| GET | /api/mocks/drivers | Generar repartidores ficticios sin guardarlos |

| POST | /api/mocks/generate | Insertar datos relacionados en MongoDB |

Los endpoints GET generan datos en memoria y no incluyen contraseñas en sus respuestas.
Generación de registros
Por defecto, POST /api/mocks/generate crea:
- 5 clientes con rol customer.
- 3 repartidores con rol driver.
- 5 pedidos asociados a clientes.
- 5 entregas asociadas a pedidos y repartidores.
También permite indicar cantidades mediante un body JSON:

{

  "customers": 2,

  "drivers": 1

}

En ese caso se generan dos clientes, un repartidor, dos pedidos y dos entregas.

Cada ejecución crea un nuevo conjunto de registros.
Relaciones entre entidades
Los registros generados mantienen las siguientes relaciones:
- Cada pedido referencia a un cliente existente.
- Cada entrega referencia a un pedido existente.
- Cada entrega tiene un repartidor asignado.
- Cada pedido referencia a su entrega correspondiente.
Las referencias utilizan identificadores ObjectId de MongoDB.
Roles, estados y prioridades
Los datos simulados utilizan las constantes definidas en src/constants/index.js.

Esto permite mantener consistencia con los modelos de Mongoose.
Pruebas con Postman
1. Generar clientes

GET http://localhost:8080/api/mocks/users

Resultado esperado: 200 OK con 10 clientes ficticios.

2. Generar repartidores

GET http://localhost:8080/api/mocks/drivers

Resultado esperado: 200 OK con 10 repartidores ficticios.

3. Insertar datos en MongoDB

POST http://localhost:8080/api/mocks/generate

Sin body, la respuesta esperada es 201 Created:

{

  "status": "success",

  "message": "Datos de prueba generados correctamente",

  "payload": {

    "customers": 5,

    "drivers": 3,

    "orders": 5,

    "deliveries": 5

  }

}

4. Generar cantidades personalizadas

POST http://localhost:8080/api/mocks/generate

Body JSON:

{

  "customers": 2,

  "drivers": 1

}

Resultado esperado: 201 Created, con dos clientes, un repartidor, dos pedidos y dos entregas.
Validación de relaciones
Durante las pruebas se verificó que las referencias entre pedidos, entregas y usuarios fueran válidas.

Resultados obtenidos en una ejecución:

Pedidos con relaciones válidas: 5 / 5

Entregas con relaciones válidas: 5 / 5

Limpieza ante errores
Si ocurre una falla durante la generación, el sistema intenta eliminar los registros creados.

Como MongoDB local se utiliza sin replica set, esta limpieza compensatoria no equivale a una transacción y no garantiza una reversión completa ante todos los errores.
Módulo 3: Manejo profesional de errores
Se implementó un sistema centralizado de manejo de errores para ShipNow API.

El objetivo es evitar respuestas de error dispersas y devolver un formato HTTP consistente.
Componentes
- src/errors/CustomError.js: define los errores personalizados.
- src/errors/errorDictionary.js: contiene los códigos, mensajes y estados HTTP.
- src/middlewares/errorHandler.js: transforma los errores en respuestas HTTP uniformes.
Los Services detectan los errores del dominio y lanzan errores personalizados.

Los Controllers derivan los errores mediante next(error).

El middleware global genera la respuesta final de error.
Estructura de respuesta
Todos los errores utilizan el siguiente formato:

{

  "status": "error",

  "code": "USER_NOT_FOUND",

  "message": "Usuario no encontrado"

}

Cuando corresponde, se incluye el campo opcional details:

{

  "status": "error",

  "code": "INVALID_MOCK_QUANTITY",

  "message": "La cantidad de mocks debe ser un número entero positivo",

  "details": "La cantidad debe ser un número entero entre 1 y 100"

}

Diccionario de errores
El diccionario incluye errores de usuarios, productos, pedidos, entregas, mocks y errores generales.

Entre los códigos disponibles se encuentran:

| Código | HTTP | Descripción |

|---|---|---|

| USER_NOT_FOUND | 404 | Usuario inexistente |

| PRODUCT_NOT_FOUND | 404 | Producto inexistente |

| ORDER_NOT_FOUND | 404 | Pedido inexistente |

| DELIVERY_NOT_FOUND | 404 | Entrega inexistente |

| INVALID_ID | 400 | Identificador inválido |

| INVALID_DATA | 400 | Datos inválidos |

| INVALID_MOCK_QUANTITY | 400 | Cantidad inválida de mocks |

| INVALID_PRODUCT_PRICE | 400 | Precio de producto inválido |

| USER_ALREADY_EXISTS | 409 | Usuario duplicado |

| PRODUCT_ALREADY_EXISTS | 409 | Producto duplicado |

| DUPLICATE_RECORD | 409 | Registro duplicado |

| MOCKS_NOT_ALLOWED | 403 | Generación de mocks no permitida |

| DATABASE_ERROR | 500 | Error de base de datos |

| ROUTE_NOT_FOUND | 404 | Ruta inexistente |

| INTERNAL_ERROR | 500 | Error interno |
Pruebas de errores con Postman
Para realizar las pruebas:

1. Iniciar MongoDB.

2. Configurar .env con NODE_ENV=development.

3. Ejecutar npm start.

4. Abrir Postman.

1. Ruta inexistente

GET http://localhost:8080/api/ruta-inexistente

Resultado esperado:
- HTTP 404 Not Found.
- Código ROUTE_NOT_FOUND.
2. Usuario inexistente

GET http://localhost:8080/api/users/507f1f77bcf86cd799439011

Resultado esperado:
- HTTP 404 Not Found.
- Código USER_NOT_FOUND.
3. Identificador inválido

GET http://localhost:8080/api/users/123

Resultado esperado:
- HTTP 400 Bad Request.
- Código INVALID_ID.
4. Producto inexistente

GET http://localhost:8080/api/products/507f1f77bcf86cd799439011

Resultado esperado:
- HTTP 404 Not Found.
- Código PRODUCT_NOT_FOUND.
5. Precio negativo

POST http://localhost:8080/api/products

Body JSON:

{

  "title": "Producto de prueba",

  "code": "TEST-ERROR-003",

  "price": -100,

  "stock": 5

}

Resultado esperado:
- HTTP 400 Bad Request.
- Código INVALID_PRODUCT_PRICE.
6. Cantidad negativa de mocks

GET http://localhost:8080/api/mocks/users?quantity=-5

Resultado esperado:
- HTTP 400 Bad Request.
- Código INVALID_MOCK_QUANTITY.
7. Cantidad no numérica de mocks

GET http://localhost:8080/api/mocks/drivers?quantity=abc

Resultado esperado:
- HTTP 400 Bad Request.
- Código INVALID_MOCK_QUANTITY.
8. Cantidad inválida al insertar mocks

POST http://localhost:8080/api/mocks/generate

Body JSON:

{

  "customers": -5,

  "drivers": 3

}

Resultado esperado:
- HTTP 400 Bad Request.
- Código INVALID_MOCK_QUANTITY.
9. Generación válida de mocks

POST http://localhost:8080/api/mocks/generate

Body JSON:

{

  "customers": 2,

  "drivers": 1

}

Resultado esperado:
- HTTP 201 Created.
- Dos clientes.
- Un repartidor.
- Dos pedidos.
- Dos entregas.
Errores de MongoDB
El middleware global contempla:
- Errores de validación de Mongoose: 400 Bad Request.
- Identificadores inválidos: 400 Bad Request.
- Registros duplicados: 409 Conflict.
- Errores inesperados: 500 Internal Server Error.
Los errores inesperados se registran mediante Winston sin exponer detalles internos al cliente.
Seguridad
La inserción de mocks solo está habilitada cuando:

NODE_ENV=development

En otros entornos, la generación de registros de prueba se rechaza.
Módulo 4: Logging y monitoreo básico
Se incorporó Winston como logger centralizado, junto con winston-daily-rotate-file para almacenar y rotar los registros importantes. El sistema complementa al middleware global de errores del módulo 3.
Configuración
El logger se configura en src/config/logger.config.js y se reutiliza en distintos módulos de la aplicación. Cada registro muestra la fecha, la hora, el nivel y el mensaje:
2026-11-17 09:48:40 [info] Conexión a MongoDB establecida correctamente
2026-11-17 09:48:40 [info] Servidor ShipNow escuchando en el puerto 8080
2026-11-17 09:48:59 [warning] Cantidad inválida de mocks recibida: -5
Niveles de logging
Nivel	Uso
debug	Información detallada para depuración
http	Eventos relacionados con solicitudes HTTP
info	Inicio del servidor, conexión a MongoDB y operaciones exitosas
warning	Errores esperados, validaciones y situaciones que requieren atención
error	Fallas de operaciones o errores inesperados
fatal	Fallas críticas del sistema


Desarrollo y producción
El comportamiento depende de NODE_ENV en el archivo .env:
- NODE_ENV=development: la consola muestra todos los niveles, desde debug hasta fatal.
- NODE_ENV=production: la consola muestra desde info hasta fatal; los niveles debug y http quedan excluidos.
En ambos entornos, el archivo de errores registra únicamente los niveles error y fatal.
Integración con ShipNow
El logger se utiliza para registrar el inicio del servidor, la conexión exitosa o fallida a MongoDB, los errores procesados por el middleware global y los eventos relevantes de generación de mocks. Las cantidades inválidas se registran como advertencias y las fallas durante la generación de mocks como errores.

Las respuestas HTTP conservan el formato uniforme implementado en el módulo 3. Los logs son registros internos y no se envían al cliente.
Endpoint de prueba
Con MongoDB funcionando y NODE_ENV=development, iniciar la aplicación:
npm start
En Postman ejecutar:
GET http://localhost:8080/api/logger/test
Respuesta esperada: 200 OK.
{
  "status": "success",
  "message": "Prueba de logging ejecutada correctamente",
  "levels": ["debug", "http", "info", "warning", "error", "fatal"]
}
El endpoint emite un mensaje por cada nivel. En desarrollo se pueden verificar los seis registros en la consola. Está restringido al entorno de desarrollo.

Nota: los mensajes de nivel error y fatal del endpoint son pruebas intencionales, no fallas reales del servidor.
Archivos de logs y rotación
Los registros de errores se guardan automáticamente en la carpeta logs/, con archivos diarios como:
logs/error-2026-11-17.log
La configuración de rotación utiliza:
- Nombre de archivo con fecha (YYYY-MM-DD).
- Tamaño máximo de 10 MB por archivo.
- Retención de archivos durante 14 días.
- Filtro para persistir solamente error y fatal.
Para inspeccionar el archivo en Git Bash:
ls -la logs
cat logs/error-*.log
Después de llamar al endpoint de prueba, el archivo debe incluir las entradas [error] Prueba del nivel ERROR y [fatal] Prueba del nivel FATAL, sin entradas info, warning, http o debug.
Archivos excluidos de Git
El archivo .gitignore debe contener:
node_modules/
.env
logs/
De esta manera, las dependencias instaladas, las variables de entorno y los archivos de logs generados localmente no se suben a GitHub.
Estructura principal del proyecto
src/
├── config/
│   ├── env.config.js
│   └── logger.config.js
├── constants/
│   └── index.js
├── controllers/
│   ├── usersController.js
│   ├── productsController.js
│   └── mocksController.js
├── errors/
│   ├── CustomError.js
│   └── errorDictionary.js
├── middlewares/
│   └── errorHandler.js
├── models/
│   ├── user.model.js
│   ├── product.model.js
│   ├── order.model.js
│   └── delivery.model.js
├── repositories/
│   ├── user.repository.js
│   ├── product.repository.js
│   └── mocks.repository.js
├── routes/
│   ├── users.js
│   ├── products.js
│   ├── mocks.router.js
│   └── logger.router.js
├── services/
│   ├── usersService.js
│   ├── productsService.js
│   └── mocksService.js
├── utils/
│   └── mockGenerator.js
└── server.js
Consideraciones
- Los mocks permiten generar información ficticia para pruebas.
- Los datos respetan los modelos y las constantes del proyecto.
- Las relaciones se mantienen mediante referencias de MongoDB.
- Las contraseñas almacenadas se protegen mediante hashes.
- Se recomienda utilizar una base de datos independiente para las pruebas.
- El archivo .env, la carpeta node_modules/ y los archivos de logs/ no deben subirse al repositorio.
- El manejo de errores se encuentra centralizado mediante un middleware global.
- Winston permite registrar eventos relevantes y conservar errores en archivos rotativos.
Autor
Gastón Brecciaroli

Programación Backend III - Coderhouse