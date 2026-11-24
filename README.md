ShipNow API
Proyecto final de Programación Backend III - Coderhouse.

Incluye los Módulos 1 al 7: arquitectura por capas, mocks, manejo de errores, logging, Swagger, testing automatizado y carga de archivos con Multer.
Descripción
ShipNow API es una aplicación desarrollada con Node.js, Express y MongoDB para la gestión de usuarios, productos, pedidos y entregas, además de la generación de datos de prueba.

El proyecto incorpora arquitectura por capas, generación de mocks, manejo centralizado de errores, logging con Winston, documentación Swagger/OpenAPI 3.0.3 testing automatizado y carga de archivos con Multer.
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
- swagger-ui-express
- swagger-jsdoc
- OpenAPI 3.0.3
- Mocha, Chai, Supertest y cross-env
- Multer
Arquitectura
El proyecto utiliza una arquitectura por capas:
Router → Controller → Service → Repository → Model → MongoDB
Router
Define las rutas HTTP y conecta las solicitudes con los controladores correspondientes.
Controller
Recibe las peticiones HTTP, llama al Service correspondiente y devuelve las respuestas exitosas.

No realiza consultas directas a MongoDB.

Los errores se derivan al middleware global mediante next(error).
Service
Contiene la lógica de negocio y las validaciones.

Entre sus responsabilidades se encuentran:
- Validar usuarios y productos.
- Evitar la creación de administradores desde el endpoint público.
- Detectar registros inexistentes o duplicados.
- Determinar el estado de los productos según su stock.
- Calcular costos de envío.
- Validar cantidades de mocks.
- Generar y relacionar datos simulados.
- Validar identificadores de pedidos y entregas.
- Lanzar errores personalizados cuando corresponde.
Repository
Centraliza el acceso a MongoDB mediante Mongoose.

Contiene operaciones como find, findById, findOne, create, findByIdAndUpdate y findByIdAndDelete.

Esta separación permite mantener desacoplada la lógica de negocio del acceso a los datos.
Instalación
Clonar el repositorio:

git clone https://github.com/gastoneze15/Backend-3.git

Ingresar a la carpeta:

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

El archivo .env no se incluye en el repositorio por seguridad. Tampoco debe versionarse .env.test.
Entorno de testing
Crear .env.test con una base local exclusiva y descartable:
NODE_ENV=test
PORT=8081
MONGODB_URI=mongodb://127.0.0.1:27017/shipnow_test
Atención: npm test limpia las colecciones de shipnow_test y los archivos de uploads-test/. No guardar datos importantes allí. La configuración y el helper de tests verifican el entorno y la base antes de limpiar registros.
Ejecución
Asegurarse de que MongoDB esté ejecutándose.

Iniciar el servidor:

npm start

También puede utilizarse:

node src/server.js

La API estará disponible en:

http://localhost:8080

Para comprobar que el servidor funciona:

GET http://localhost:8080/api/health


Módulo 1: Arquitectura por capas
En el primer módulo se reorganizó ShipNow API utilizando las capas Controller, Service y Repository.

Se implementaron operaciones de usuarios y productos, validaciones y constantes para evitar valores escritos directamente en el código.
Endpoints principales
Método	Ruta	Descripción
GET	/api/health	Verificar el estado de la API
GET	/api/users	Listar usuarios
GET	/api/users/:id	Obtener usuario por ID
POST	/api/users	Crear usuario
PUT	/api/users/:id	Actualizar usuario
DELETE	/api/users/:id	Eliminar usuario
GET	/api/products	Listar productos disponibles
GET	/api/products?all=true	Listar todos los productos
GET	/api/products/:id	Obtener producto por ID
POST	/api/products	Crear producto
PUT	/api/products/:id	Actualizar producto
DELETE	/api/products/:id	Eliminar producto
GET	/api/products/:id/shipping-cost	Calcular el costo de envío


Constantes
Las constantes se encuentran centralizadas en:

src/constants/index.js

Se utilizan para representar:
- Roles de usuario.
- Estados de productos.
- Estados de pedidos.
- Estados de entregas.
- Prioridades de entrega.
- Tipos de documentos.


Módulo 2: Generación de Mocks
Se incorporó un módulo para generar datos ficticios de clientes, repartidores, pedidos y entregas.

La implementación utiliza @faker-js/faker para generar información simulada y bcryptjs para almacenar las contraseñas mediante hashes.

El módulo respeta los modelos reales y la arquitectura por capas.
Endpoints de mocks
Método	Ruta	Descripción
GET	/api/mocks/users	Generar clientes ficticios sin guardarlos
GET	/api/mocks/drivers	Generar repartidores ficticios sin guardarlos
POST	/api/mocks/generate	Insertar datos relacionados en MongoDB


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
- Pedidos con relaciones válidas: 5 / 5.
- Entregas con relaciones válidas: 5 / 5.
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
Código	HTTP	Descripción
USER_NOT_FOUND	404	Usuario inexistente
PRODUCT_NOT_FOUND	404	Producto inexistente
ORDER_NOT_FOUND	404	Pedido inexistente
DELIVERY_NOT_FOUND	404	Entrega inexistente
INVALID_ID	400	Identificador inválido
INVALID_DATA	400	Datos inválidos
INVALID_MOCK_QUANTITY	400	Cantidad inválida de mocks
INVALID_PRODUCT_PRICE	400	Precio de producto inválido
USER_ALREADY_EXISTS	409	Usuario duplicado
PRODUCT_ALREADY_EXISTS	409	Producto duplicado
DUPLICATE_RECORD	409	Registro duplicado
MOCKS_NOT_ALLOWED	403	Generación de mocks no permitida
DATABASE_ERROR	500	Error de base de datos
ROUTE_NOT_FOUND	404	Ruta inexistente
INTERNAL_ERROR	500	Error interno
INVALID_USER_DATA	400	Datos de usuario inválidos
ADMIN_CREATION_FORBIDDEN	400	Creación o asignación de administrador no permitida
INVALID_PRODUCT_DATA	400	Datos de producto inválidos
INVALID_ORDER_STATUS	400	Estado de pedido inválido
LOGGER_NOT_ALLOWED	403	Prueba de logging no permitida
FILE_REQUIRED	400	Archivo obligatorio
INVALID_FILE_TYPE	415	Tipo de archivo no permitido
FILE_TOO_LARGE	413	Archivo demasiado grande
INVALID_FILE_FIELD	400	Campo de archivo inválido
INVALID_DOCUMENT_TYPE	400	Tipo de documento inválido
INVALID_MULTIPART_DATA	400	Formulario multipart inválido
FILE_UPLOAD_ERROR	500	Error al guardar archivo
PROOF_ALREADY_EXISTS	409	Comprobante ya asociado


Pruebas de errores con Postman
Para realizar las pruebas:
1. Iniciar MongoDB.
2. Configurar .env con NODE_ENV=development.
3. Ejecutar npm start.
4. Abrir Postman.
5. Ruta inexistente
GET http://localhost:8080/api/ruta-inexistente

Resultado esperado:
- HTTP 404 Not Found.
- Código ROUTE_NOT_FOUND.
2. Usuario inexistente
GET http://localhost:8080/api/users/507f1f77bcf86cd799439011

Resultado esperado, si el ID no existe:
- HTTP 404 Not Found.
- Código USER_NOT_FOUND.
3. Identificador inválido
GET http://localhost:8080/api/users/123

Resultado esperado:
- HTTP 400 Bad Request.
- Código INVALID_ID.
4. Producto inexistente
GET http://localhost:8080/api/products/507f1f77bcf86cd799439011

Resultado esperado, si el ID no existe:
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
La inserción de mocks solo está habilitada con NODE_ENV=development o NODE_ENV=test. Se rechaza en producción.


Módulo 4: Logging y monitoreo básico
Se incorporó Winston como logger centralizado, junto con winston-daily-rotate-file para almacenar y rotar los registros importantes.

El sistema complementa al middleware global de errores del módulo 3.
Configuración
El logger se configura en src/config/logger.config.js y se reutiliza en distintos módulos de la aplicación.

Cada registro muestra la fecha, la hora, el nivel y el mensaje.

Ejemplos:

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
El comportamiento depende de NODE_ENV, leído mediante env.config.js antes de configurar el logger. En testing se utiliza .env.test.
- NODE_ENV=development: la consola muestra todos los niveles, desde debug hasta fatal.
- NODE_ENV=production: la consola muestra desde info hasta fatal; los niveles debug y http quedan excluidos.
En ambos entornos, el archivo de errores registra únicamente los niveles error y fatal.
Integración con ShipNow
El logger se utiliza para registrar:
- Inicio del servidor.
- Conexión exitosa o fallida a MongoDB.
- Errores procesados por el middleware global.
- Eventos relevantes de generación de mocks.
Las cantidades inválidas se registran como advertencias y las fallas durante la generación de mocks como errores.

Las respuestas HTTP conservan el formato uniforme implementado en el módulo 3.

Los logs son registros internos y no se envían al cliente.
Endpoint de prueba
Con MongoDB funcionando y NODE_ENV=development, iniciar la aplicación:

npm start

En Postman ejecutar:

GET http://localhost:8080/api/logger/test

Respuesta esperada: 200 OK.
{

  "status": "success",
  "message": "Prueba de logging ejecutada correctamente",
  "levels": [
    "debug",
    "http",
    "info",
    "warning",
    "error",
    "fatal"
  ]
}
El endpoint emite un mensaje por cada nivel.

En desarrollo se pueden verificar los seis registros en la consola.

Está restringido a los entornos de desarrollo y testing. En producción responde HTTP 403 con LOGGER_NOT_ALLOWED.

Los mensajes de nivel error y fatal del endpoint son pruebas intencionales, no fallas reales del servidor.
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

Después de llamar al endpoint de prueba, el archivo debe incluir las entradas de prueba de nivel error y fatal, sin entradas info, warning, http o debug.
Archivos excluidos de Git
El archivo .gitignore debe contener:
node_modules/
.env
.env.*
!.env.example
logs/
uploads/
uploads-test/
De esta manera, las dependencias instaladas, las variables de entorno y los archivos de logs generados localmente no se suben a GitHub.


Módulo 5: Documentación de API con Swagger
Se incorporó documentación interactiva de la API mediante Swagger UI y OpenAPI 3.0.3.

El objetivo es documentar los endpoints existentes, sus parámetros, las estructuras de datos y las posibles respuestas HTTP.

La documentación permite explorar los recursos y ejecutar solicitudes directamente desde el navegador.
Dependencias
Se incorporaron las siguientes librerías:
- swagger-ui-express
- swagger-jsdoc
La especificación OpenAPI se configura en:

src/config/swagger.config.js

Los archivos de documentación se encuentran en:

src/docs/
Acceso a Swagger
Primero, iniciar MongoDB y ejecutar:

npm start

Después abrir en el navegador:

http://localhost:8080/api/docs

Swagger UI muestra los endpoints documentados y permite probarlos mediante las opciones Try it out y Execute.
Organización de la documentación
La documentación se divide en cinco secciones:
Sección	Descripción
Users	Gestión de usuarios y documentos
Orders	Consulta, creación y actualización de estado de pedidos
Deliveries	Consulta de entregas y carga de comprobantes
Mocks	Generación de datos ficticios
Logger	Pruebas del sistema de logging


Archivos de Swagger
La documentación se organiza en los siguientes archivos:
- src/config/swagger.config.js: configuración general de OpenAPI.
- src/docs/schemas.yaml: esquemas de datos reutilizables.
- src/docs/users.yaml: documentación de usuarios.
- src/docs/orders.yaml: documentación de pedidos.
- src/docs/deliveries.yaml: documentación de entregas.
- src/docs/mocks.yaml: documentación de mocks.
- src/docs/logger.yaml: documentación del logger.
Esta organización permite mantener separadas las definiciones de cada recurso.
Esquemas documentados
Se definieron los siguientes esquemas:
Esquema	Descripción
User	Información de un usuario
CreateUser	Datos necesarios para crear un usuario
OrderItem	Producto incluido en un pedido
Order	Información de un pedido
Delivery	Información de una entrega
SuccessResponse	Estructura general de respuesta exitosa
ErrorResponse	Estructura general de respuesta de error
FileMetadata	Metadatos de archivos
UploadUserDocument	Formulario multipart de documentos
UploadDeliveryProof	Formulario multipart de comprobantes


Los esquemas permiten reutilizar las estructuras de datos en distintos endpoints mediante referencias $ref.
Endpoints documentados
Users
Método	Ruta	Descripción
GET	/api/users	Obtener todos los usuarios
GET	/api/users/{id}	Obtener un usuario por ID
POST	/api/users	Crear un usuario
PUT	/api/users/{id}	Actualizar un usuario
DELETE	/api/users/{id}	Eliminar un usuario
POST	/api/users/{id}/documents	Cargar documento o licencia


Orders
Método	Ruta	Descripción
GET	/api/orders	Obtener todos los pedidos
GET	/api/orders/{id}	Obtener un pedido por ID
POST	/api/orders	Crear un pedido
PATCH	/api/orders/{id}/status	Actualizar el estado de un pedido


Para incorporar estas consultas se agregaron repositorio, servicio, controlador y rutas específicas de pedidos.

Las consultas permiten obtener los pedidos almacenados en MongoDB, incluyendo información del cliente y la entrega asociada. También se puede crear un pedido para un cliente existente y actualizar su estado.

Ejemplo de creación (reemplazar customer por un ID de usuario existente):
{

  "customer": "507f1f77bcf86cd799439011",
  "items": [{ "name": "Producto de prueba", "quantity": 2, "price": 1500 }],
  "deliveryAddress": "Av. Corrientes 1234"
}
El total se calcula automáticamente (3000 en este ejemplo). Estados permitidos: created, assigned, picked_up, in_transit, delivered y cancelled. Para cambiarlo, enviar PATCH /api/orders/:id/status con { "status": "assigned" }.
Deliveries
Método	Ruta	Descripción
GET	/api/deliveries	Obtener todas las entregas
GET	/api/deliveries/{id}	Obtener una entrega por ID
POST	/api/deliveries/{id}/proof	Cargar comprobante


Para incorporar estas consultas se agregaron repositorio, servicio, controlador y rutas específicas de entregas.

Las consultas permiten obtener las entregas almacenadas en MongoDB, incluyendo información del pedido y el repartidor asociado.
Mocks
Método	Ruta	Descripción
GET	/api/mocks/users	Generar usuarios ficticios
GET	/api/mocks/drivers	Generar repartidores ficticios
POST	/api/mocks/generate	Insertar datos ficticios en MongoDB


El endpoint POST está restringido a los entornos de desarrollo y testing.
Logger
Método	Ruta	Descripción
GET	/api/logger/test	Ejecutar pruebas de logging


El endpoint de prueba está restringido a los entornos de desarrollo y testing.
Respuestas HTTP documentadas
Los endpoints incluyen las respuestas HTTP que corresponden a sus operaciones.

Entre ellas:
Código	Significado
200	Operación exitosa
201	Recurso creado correctamente
400	Datos o identificador inválido
403	Operación no permitida
404	Recurso no encontrado
409	Conflicto por registro o comprobante duplicado
413	Archivo demasiado grande
415	Tipo de archivo no permitido
500	Error interno del servidor


Los errores utilizan la estructura uniforme implementada en el módulo 3.
Pruebas realizadas desde Swagger
Se verificaron los endpoints de pedidos y entregas directamente desde Swagger UI.
1. Obtener todos los pedidos
GET http://localhost:8080/api/orders

Resultado obtenido:
- HTTP 200 OK.
- Respuesta con status: success.
- Listado de pedidos registrados en MongoDB.
- Información del cliente y la entrega asociada.
2. Obtener todas las entregas
GET http://localhost:8080/api/deliveries

Resultado obtenido:
- HTTP 200 OK.
- Respuesta con status: success.
- Listado de entregas registradas en MongoDB.
- Información del pedido y repartidor asociado.
3. Identificador inválido en Orders
GET http://localhost:8080/api/orders/abc123

Resultado obtenido: HTTP 400 Bad Request.
{

  "status": "error",
  "code": "INVALID_ID",
  "message": "El identificador proporcionado no es válido"
}
4. Pedido inexistente
GET http://localhost:8080/api/orders/000000000000000000000000

Resultado obtenido: HTTP 404 Not Found.
{

  "status": "error",
  "code": "ORDER_NOT_FOUND",
  "message": "Pedido no encontrado"
}
5. Identificador inválido en Deliveries
GET http://localhost:8080/api/deliveries/abc123

Resultado obtenido: HTTP 400 Bad Request.
{

  "status": "error",
  "code": "INVALID_ID",
  "message": "El identificador proporcionado no es válido"
}
6. Entrega inexistente
GET http://localhost:8080/api/deliveries/000000000000000000000000

Resultado obtenido: HTTP 404 Not Found.
{

  "status": "error",
  "code": "DELIVERY_NOT_FOUND",
  "message": "Entrega no encontrada"
}
Estas pruebas permitieron verificar la correspondencia entre las respuestas de la API y los errores documentados en Swagger.
Consideraciones de seguridad
Swagger UI está disponible en /api/docs durante las pruebas locales.

Las entregas tienen endpoints de consulta y carga de comprobantes. Los pedidos también permiten creación y actualización de estado.

Actualmente no incorporan autenticación ni autorización, por lo que deben protegerse antes de utilizar la API en un entorno público o de producción.

La documentación no reemplaza los controles de seguridad del servidor.


Módulo 6: Testing automatizado
Se incorporaron Mocha, Chai y Supertest para verificar el comportamiento HTTP, las validaciones, los casos de error y la documentación. cross-env configura NODE_ENV=test de forma compatible entre sistemas operativos.
Ejecución de los tests
1. Iniciar MongoDB local.
2. Crear .env.test con la configuración de testing indicada en la sección de variables de entorno.
3. Desde la raíz del proyecto, ejecutar:
npm test

El script utiliza Mocha para ejecutar tests/***/**.test.js, con un timeout de 10 segundos por prueba.
Pruebas implementadas
Archivo	Tests	Qué verifica
tests/users.test.js	17	CRUD, validaciones y protección de campos
tests/orders.test.js	9	Consulta, creación y cambio de estado
tests/deliveries.test.js	4	Consulta y errores
tests/mocks.test.js	6	Generación y persistencia de mocks
tests/logger.test.js	2	Endpoint y respuesta de logging
tests/swagger.test.js	12	OpenAPI, endpoints y esquemas multipart
tests/errors.test.js	7	Errores uniformes y JSON malformado
tests/uploads.test.js	20	Cargas, rechazos, persistencia y limpieza compensatoria
Total	77	Pruebas automatizadas


Al finalizar el Módulo 6 se obtuvieron 42 passing. Con el Módulo 7 se agregaron 35 pruebas y se confirmó un resultado de 77 passing.
Base aislada y limpieza
tests/helpers/testDb.js conecta, limpia y desconecta MongoDB. Las pruebas utilizan exclusivamente shipnow_test, comprueban que la conexión sea local y verifican el nombre de la base antes de borrar registros. Esta base es descartable y no debe contener información importante.

Se prueban respuestas exitosas 200 y 201, así como errores 400 y 404, con estructuras JSON consistentes que incluyen status, code y message cuando corresponde.
Buenas prácticas de testing
- Separación entre la configuración de Express (src/app.js) y el arranque del servidor (src/server.js).
- Pruebas organizadas por recurso.
- Preparación y limpieza de datos de prueba.
- Validación de respuestas HTTP y persistencia en MongoDB.
- Comprobación de la documentación OpenAPI.
- Ejecución repetida para detectar interferencias entre pruebas.


Módulo 7: Carga de archivos con Multer
Se incorporó la carga de documentos de usuarios, licencias de conducir y comprobantes de entrega, manteniendo la arquitectura por capas.
Configuración y almacenamiento
- src/config/multer.config.js: configuración centralizada, almacenamiento temporal en memoria, filtro MIME y extensión, firmas binarias, nombres UUID y límite de 5 MiB (5.242.880 bytes).
- src/middlewares/upload.middleware.js: recibe un archivo en el campo file, valida multipart y transforma errores de Multer en errores del dominio.
- src/services/filesService.js: valida, guarda archivos, genera metadatos y realiza limpieza compensatoria.
- src/models/fileMetadata.schema.js: esquema reutilizable de metadatos.
Tipo de documento	Carpeta relativa
user_document	documents/
driver_license	licenses/
delivery_proof	delivery-proofs/


uploads/
├── documents/
├── licenses/
└── delivery-proofs/
En testing se utiliza uploads-test/ con la misma estructura. Las carpetas se crean automáticamente y ambas raíces están excluidas de Git. Se admiten PDF, JPEG (.jpg y .jpeg) y PNG. Se comprueban extensión, MIME declarado y firma inicial; esto no equivale a validar íntegramente el contenido ni a un análisis antivirus.
Endpoints de carga
Método	Ruta	Campos multipart	Éxito
POST	/api/users/:id/documents	file, documentType	201
POST	/api/deliveries/:id/proof	file	201


Para usuarios, documentType debe ser user_document o driver_license. Para entregas se asigna automáticamente delivery_proof. Se verifica que la entidad exista antes de guardar. Los documentos se agregan al array documents; el comprobante se guarda en proof, con actualización condicional para impedir duplicados.
Pruebas manuales
En Postman seleccionar POST, Body → form-data, campo file de tipo File y, para usuarios, campo documentType de tipo Text. Usar un ID existente. No establecer manualmente el boundary de Content-Type.

Ejemplos en Git Bash (reemplazar los IDs y nombres de archivo):
curl -X POST http://localhost:8080/api/users/ID_USUARIO/documents \
  -F 'file=@documento.png' -F 'documentType=user_document'
curl -X POST http://localhost:8080/api/deliveries/ID_ENTREGA/proof \
  -F 'file=@comprobante.pdf'
La respuesta exitosa contiene status: success, message y payload con la entidad actualizada. Consultar luego GET /api/users/:id o GET /api/deliveries/:id para verificar la persistencia.
Metadatos
MongoDB conserva únicamente los metadatos del archivo, no sus bytes. Ejemplo ilustrativo:
{
  "originalName": "documento.png",
  "fileName": "550e8400-e29b-41d4-a716-446655440000.png",
  "path": "documents/550e8400-e29b-41d4-a716-446655440000.png",
  "mimeType": "image/png",
  "size": 47001,
  "documentType": "user_document",
  "uploadedAt": "2026-11-24T10:00:00.000Z"
}
Mongoose agrega un _id al subdocumento. Las rutas son relativas a la raíz de uploads. Los archivos se escriben con wx para evitar sobrescrituras.
Validaciones y recuperación
Escenario	HTTP	Código
Sin archivo	400	FILE_REQUIRED
Campo incorrecto	400	INVALID_FILE_FIELD
Tipo de documento inválido	400	INVALID_DOCUMENT_TYPE
Multipart inválido	400	INVALID_MULTIPART_DATA
ID inválido	400	INVALID_ID
Usuario inexistente	404	USER_NOT_FOUND
Entrega inexistente	404	DELIVERY_NOT_FOUND
Comprobante duplicado	409	PROOF_ALREADY_EXISTS
Archivo demasiado grande	413	FILE_TOO_LARGE
Formato o firma inválidos	415	INVALID_FILE_TYPE
Error de escritura	500	FILE_UPLOAD_ERROR
Fallo interno inesperado	500	INTERNAL_ERROR


Si falla la asociación de metadatos, el servicio intenta eliminar el archivo recién creado. Dos tests simulan fallos del repositorio antes de persistir y verifican la eliminación y conservación de los datos anteriores. No es una transacción entre MongoDB y el sistema de archivos; no garantiza recuperación ante cualquier caída, error ambiguo de escritura o fallo de eliminación.

Winston registra cargas, asociaciones, rechazos y errores. El middleware global también devuelve HTTP 400 con INVALID_DATA para JSON malformado, sin incluir el cuerpo inválido en el mensaje de log.
Swagger y testing
Swagger UI documenta los dos endpoints mediante multipart/form-data, campos binarios, tipos permitidos, metadatos y respuestas de error. Los esquemas UploadUserDocument, UploadDeliveryProof y FileMetadata se reutilizan mediante referencias $ref.

Los 20 tests de uploads cubren documentos, licencias, comprobantes, formatos, límites, rechazos, persistencia, duplicados y limpieza ante fallos simulados. Los tests adicionales de usuarios verifican exclusión de contraseñas, protección del array de documentos y rechazo de roles inválidos o administrativos. La suite completa alcanza 77 pruebas exitosas.
Seguridad y alcance
No se publica una ruta estática para descargar los documentos. La protección de rutas de eliminación es básica y no cubre todos los escenarios con enlaces simbólicos. La API académica aún requiere autenticación, autorización por recurso, gestión segura de contraseñas y políticas de conservación de archivos antes de un despliegue público. No se garantiza limpieza automática de archivos al eliminar una entidad.
Estructura principal del proyecto
src/
├── app.js
├── config/
│   ├── env.config.js
│   ├── logger.config.js
│   ├── swagger.config.js
│   └── multer.config.js
├── constants/
│   └── index.js
├── controllers/
│   ├── usersContoller.js
│   ├── productsController.js
│   ├── mocksController.js
│   ├── ordersController.js
│   └── deliveriesController.js
├── docs/
│   ├── schemas.yaml
│   ├── users.yaml
│   ├── orders.yaml
│   ├── deliveries.yaml
│   ├── mocks.yaml
│   └── logger.yaml
├── errors/
│   ├── CustomError.js
│   └── errorDictionary.js
├── middlewares/
│   ├── errorHandler.js
│   └── upload.middleware.js
├── models/
│   ├── user.model.js
│   ├── product.model.js
│   ├── order.model.js
│   ├── delivery.model.js
│   └── fileMetadata.schema.js
├── repositories/
│   ├── user.repository.js
│   ├── product.repository.js
│   ├── mocks.repository.js
│   ├── order.repository.js
│   └── delivery.repository.js
├── routes/
│   ├── users.js
│   ├── products.js
│   ├── mocks.router.js
│   ├── logger.router.js
│   ├── orders.router.js
│   └── deliveries.router.js
├── services/
│   ├── usersService.js
│   ├── productsService.js
│   ├── mocksService.js
│   ├── ordersService.js
│   ├── deliveriesService.js
│   └── filesService.js
├── utils/
│   └── mockGenerator.js
└── server.js
tests/
├── helpers/
│   └── testDb.js
├── users.test.js
├── orders.test.js
├── deliveries.test.js
├── mocks.test.js
├── logger.test.js
├── swagger.test.js
├── errors.test.js
└── uploads.test.js


## Auditoría y actualización de dependencias

Durante el desarrollo del Módulo 7 se realizó una auditoría
de seguridad de las dependencias mediante npm audit.

### Resultados de la auditoría

| Etapa | Moderadas | Altas | Total |
|---|---:|---:|---:|
| Auditoría inicial | 6 | 2 | 8 |
| Después de npm audit fix | 5 | 0 | 5 |
| Después de aplicar overrides | 0 | 0 | 0 |

### Correcciones implementadas

- Actualización de dependencias mediante npm audit fix.
- Configuración de overrides en package.json.
- Actualización de glob a la versión 14.0.6.
- Actualización de minimatch a la versión 11.0.9.
- Actualización del archivo package-lock.json.
- Conservación de las versiones principales de Mocha,
  Nodemon y Swagger-jsdoc.

No se utilizó npm audit fix --force.

### Verificaciones posteriores

- Node.js: v22.21.0.
- npm audit: 0 vulnerabilidades detectadas.
- npm audit --omit=dev: 0 vulnerabilidades detectadas.
- Testing automatizado: 77 passing.
- Inicio correcto del servidor mediante Nodemon.
- Conexión exitosa a MongoDB.
- Visualización correcta de Swagger UI.

Auditoría realizada el 24 de noviembre de 2026.

Los resultados corresponden a las dependencias instaladas
y a las vulnerabilidades conocidas al momento de la auditoría.
No garantizan la ausencia de vulnerabilidades en la aplicación.

Los overrides deberán revisarse en futuras actualizaciones
para mantener la compatibilidad entre dependencias.


Consideraciones finales
- No versionar uploads/, uploads-test/ ni .env.test.
- Las pruebas de carga utilizan almacenamiento aislado y eliminan los archivos de testing al finalizar.
- Los mocks permiten generar información ficticia para pruebas.
- Los datos respetan los modelos y las constantes del proyecto.
- Las relaciones se mantienen mediante referencias de MongoDB.
- Las contraseñas de los mocks se generan mediante hashes bcrypt. Las respuestas de usuarios excluyen la contraseña; esto no garantiza hashing en todas las operaciones de creación y actualización.
- Se recomienda utilizar una base de datos independiente para las pruebas.
- El archivo .env, la carpeta node_modules/ y los archivos de logs/ no deben subirse al repositorio.
- El manejo de errores se encuentra centralizado mediante un middleware global.
- Winston permite registrar eventos relevantes y conservar errores en archivos rotativos.
- Swagger permite consultar y probar los endpoints documentados desde el navegador.
- Las rutas de pedidos y entregas deberán incorporar controles de acceso antes de un despliegue público. La API es un proyecto académico y no está preparada para exposición pública sin autenticación y autorización.
Autor
Gastón Brecciaroli

Programación Backend III - Coderhouse