
# ShipNow API

Pre-entregas de los Módulos 1 y 2 de Programación Backend III.

Este proyecto consiste en una API desarrollada con Node.js, Express y MongoDB para la gestión de usuarios, productos, pedidos y entregas.

En el Módulo 1 se trabajó en la refactorización de la API mediante una arquitectura por capas.

En el Módulo 2 se incorporó un módulo de mocking para generar datos ficticios y almacenarlos en MongoDB, respetando los modelos y las relaciones entre entidades.

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- JavaScript (ES Modules)
- dotenv
- CORS
- Nodemon
- @faker-js/faker
- bcryptjs

## Arquitectura

El proyecto utiliza una arquitectura por capas:

```text
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
```

### Controller

Los Controllers reciben las peticiones HTTP mediante `req`, llaman al Service correspondiente y devuelven las respuestas mediante `res`, utilizando los códigos HTTP apropiados.

Los Controllers no realizan consultas directas a MongoDB.

### Service

Los Services contienen la lógica de negocio de la aplicación.

Entre sus responsabilidades se encuentran:

- Validar usuarios existentes.
- Evitar la creación de administradores desde el endpoint público.
- Validar los datos de los productos.
- Determinar el estado de un producto según su stock.
- Filtrar productos disponibles.
- Calcular costos de envío.
- Generar datos simulados.
- Coordinar la creación de registros relacionados.

### Repository

Los Repositories se encargan del acceso a los datos.

Las operaciones de Mongoose, como `find`, `findById`, `findOne`, `create`, `findByIdAndUpdate` y `findByIdAndDelete`, se centralizan en esta capa.

Esta separación permite mantener la lógica de negocio independiente del acceso a MongoDB.

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/gastoneze15/Backend-3.git
```

Ingresar a la carpeta del proyecto:

```bash
cd Backend-3
```

Instalar las dependencias:

```bash
npm install
```

Es necesario contar con Node.js y MongoDB instalados.

## Variables de entorno

La configuración se encuentra centralizada en:

```text
src/config/env.config.js
```

Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`.

Ejemplo de configuración:

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/shipnow
NODE_ENV=development
```

Para probar el módulo de mocks se recomienda utilizar una base de datos independiente:

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/shipnow_mocks
NODE_ENV=development
```

Esto permite realizar pruebas sin modificar los registros de la base de datos original.

El archivo `.env` no se incluye en el repositorio por seguridad.

## Ejecución

Asegurarse de que MongoDB esté ejecutándose.

Iniciar el servidor con:

```bash
node src/server.js
```

La API estará disponible en:

http://localhost:8080

## Módulo 1: Arquitectura por capas

En la primera pre-entrega se reorganizó la API utilizando las capas Controller, Service y Repository.

Se implementaron operaciones relacionadas con usuarios y productos, validaciones y el uso de constantes para evitar valores escritos directamente en el código.

### Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Verificar el estado de la API |
| GET | `/api/users` | Listar usuarios |
| GET | `/api/users/:id` | Obtener usuario por ID |
| POST | `/api/users` | Crear usuario |
| PUT | `/api/users/:id` | Actualizar usuario |
| DELETE | `/api/users/:id` | Eliminar usuario |
| GET | `/api/products` | Listar productos disponibles |
| GET | `/api/products?all=true` | Listar todos los productos |
| GET | `/api/products/:id` | Obtener producto por ID |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/:id` | Actualizar producto |
| DELETE | `/api/products/:id` | Eliminar producto |
| GET | `/api/products/:id/shipping-cost` | Calcular el costo de envío |

## Módulo 2: Generación de Mocks

Se incorporó un módulo de mocking para generar datos ficticios de clientes, repartidores, pedidos y entregas.

La implementación utiliza `@faker-js/faker` para crear información simulada y `bcryptjs` para almacenar las contraseñas de los usuarios generados mediante hashes.

El módulo respeta la arquitectura por capas y utiliza los modelos reales del proyecto.

### Endpoints de mocks

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/mocks/users` | Generar 10 clientes ficticios sin guardarlos |
| GET | `/api/mocks/drivers` | Generar 10 repartidores ficticios sin guardarlos |
| POST | `/api/mocks/generate` | Insertar usuarios, pedidos y entregas en MongoDB |

Los endpoints GET generan datos en memoria y no los almacenan en la base de datos.

Las respuestas de estos endpoints no incluyen las contraseñas.

### Generación de registros

El endpoint `POST /api/mocks/generate` crea:

- 5 clientes con rol `customer`.
- 3 repartidores con rol `driver`.
- 5 pedidos asociados a clientes.
- 5 entregas asociadas a pedidos y repartidores.

Los registros se almacenan en MongoDB.

Cada ejecución del endpoint genera un nuevo conjunto de datos.

### Relaciones entre entidades

Los datos generados mantienen las siguientes relaciones:

- Cada pedido referencia a un cliente existente.
- Cada entrega referencia a un pedido existente.
- Cada entrega tiene un repartidor asignado.
- Cada pedido referencia a su entrega correspondiente.

Las relaciones se implementan utilizando identificadores `ObjectId` de MongoDB.

### Roles, estados y prioridades

Los datos generados respetan las constantes definidas en:

```text
src/constants/index.js
```

Se utilizan constantes para:

- Roles de usuario.
- Estados de pedidos.
- Estados de entregas.
- Prioridades de entregas.

Esto permite mantener consistencia con los modelos de Mongoose y evitar valores incorrectos.

## Pruebas del módulo de mocks con Postman

Para realizar las pruebas:

1. Iniciar MongoDB.
2. Configurar el archivo `.env` con `NODE_ENV=development`.
3. Iniciar el servidor con `node src/server.js`.
4. Abrir Postman y ejecutar las siguientes peticiones.

### 1. Generar clientes simulados

**Método:** GET

**URL:**

```text
http://localhost:8080/api/mocks/users
```

**Respuesta esperada:** `200 OK`

El endpoint devuelve 10 clientes ficticios con el rol `customer`.

Los usuarios generados no se almacenan en MongoDB.

### 2. Generar repartidores simulados

**Método:** GET

**URL:**

```text
http://localhost:8080/api/mocks/drivers
```

**Respuesta esperada:** `200 OK`

El endpoint devuelve 10 repartidores ficticios con el rol `driver`.

Los repartidores generados no se almacenan en MongoDB.

### 3. Insertar datos de prueba en MongoDB

**Método:** POST

**URL:**

```text
http://localhost:8080/api/mocks/generate
```

No requiere enviar un body.

**Respuesta esperada:** `201 Created`

```json
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
```

Los registros quedan almacenados en la base de datos configurada mediante `MONGODB_URI`.

Este endpoint solamente permite generar datos cuando:

```env
NODE_ENV=development
```

Si el entorno no es de desarrollo, la operación se rechaza.

## Validación de relaciones

Durante las pruebas se verificó que los pedidos y las entregas generados mantuvieran referencias válidas.

Resultados obtenidos:

```text
Pedidos con relaciones válidas: 5 / 5
Entregas con relaciones válidas: 5 / 5
```

Esto confirma que, en la ejecución probada, los pedidos estaban relacionados correctamente con sus clientes y entregas, y las entregas con sus pedidos y repartidores.

## Manejo de errores

El módulo utiliza manejo de errores durante la generación de registros.

Si ocurre un error, se intenta realizar una limpieza compensatoria de los documentos creados.

Como la instalación local de MongoDB utilizada para las pruebas no cuenta con un replica set configurado, esta limpieza no constituye una transacción y no garantiza una reversión completa ante todos los posibles errores.

## Estructura principal del proyecto

```text
src/
├── config/
│   └── env.config.js
├── constants/
│   └── index.js
├── controllers/
│   ├── usersController.js
│   ├── productsController.js
│   └── mocksController.js
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
│   └── mocks.router.js
├── services/
│   ├── usersService.js
│   ├── productsService.js
│   └── mocksService.js
├── utils/
│   └── mockGenerator.js
└── server.js
```

## Consideraciones

- Los endpoints de mocks permiten generar información ficticia para pruebas.
- Los datos simulados respetan los modelos y las constantes del proyecto.
- Las relaciones entre entidades se mantienen mediante referencias de MongoDB.
- Las contraseñas almacenadas se protegen mediante hashes.
- Se recomienda utilizar una base de datos independiente para las pruebas.
- El archivo `.env` y la carpeta `node_modules` no deben subirse al repositorio.

## Autor

Gastón Brecciaroli

Programación Backend III - Coderhouse
