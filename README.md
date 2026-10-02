# ShipNow API

Pre-entrega del Módulo 1 de Programación Backend III.

El objetivo del proyecto es refactorizar la API ShipNow utilizando una arquitectura profesional por capas, separando las responsabilidades entre Controller, Service y Repository.

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- dotenv
- CORS
- Nodemon

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

Los Controllers se encargan de recibir las peticiones HTTP mediante `req`, llamar al Service correspondiente y devolver la respuesta mediante `res` con el código HTTP apropiado.

Los Controllers no realizan consultas directas a MongoDB.

### Service

Los Services contienen la lógica de negocio de la aplicación.

Por ejemplo:

- Validar usuarios existentes.
- Evitar la creación de administradores desde el endpoint público.
- Validar los datos de los productos.
- Determinar el estado de un producto según su stock.
- Filtrar productos disponibles.
- Calcular el costo de envío.

### Repository

Los Repositories son los encargados exclusivamente del acceso a los datos.

Todas las operaciones de Mongoose como `find`, `findById`, `findOne`, `create`, `findByIdAndUpdate` y `findByIdAndDelete` se encuentran centralizadas en esta capa.

Esta separación permite que la lógica de negocio del Service sea independiente de los detalles de acceso a MongoDB.

## Variables de entorno

La configuración se encuentra centralizada en:

```text
src/config/env.config.js
```

La aplicación requiere las siguientes variables:

```env
PORT=
MONGODB_URI=
NODE_ENV=
```

Se incluye un archivo `.env.example` como referencia.

El archivo `.env` real no se incluye en el repositorio por seguridad.

Si alguna variable requerida no está configurada, la aplicación se detiene mostrando un error indicando qué variable falta.

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
npm install
```

Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`.

Ejemplo para desarrollo local:

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/shipnow
NODE_ENV=development
```

Es necesario tener MongoDB ejecutándose localmente.

## Ejecución

Modo desarrollo:

```bash
npm run dev
```

Modo producción:

```bash
npm start
```

La API estará disponible por defecto en:

```text
http://localhost:8080
```

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Health check |
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
| GET | `/api/products/:id/shipping-cost` | Calcular costo de envío |

## Constantes

Los roles de usuario y estados de producto se encuentran centralizados en:

```text
src/constants/index.js
```

Se utilizan objetos `Object.freeze` para evitar modificaciones accidentales y eliminar strings mágicos del código.

## Estructura principal

```text
src/
├── config/
│   └── env.config.js
├── constants/
│   └── index.js
├── controllers/
│   ├── usersController.js
│   └── productsController.js
├── models/
│   ├── user.model.js
│   └── product.model.js
├── repositories/
│   ├── user.repository.js
│   └── product.repository.js
├── routes/
│   ├── users.js
│   └── products.js
├── services/
│   ├── usersService.js
│   └── productsService.js
├── utils/
└── server.js
```

## Autor

Gastón Brecciaroli