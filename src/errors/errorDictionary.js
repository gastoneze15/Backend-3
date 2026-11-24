
export const ERROR_CODES = Object.freeze({

    USER_NOT_FOUND: 'USER_NOT_FOUND',
    USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
    INVALID_USER_DATA: 'INVALID_USER_DATA',
    ADMIN_CREATION_FORBIDDEN: 'ADMIN_CREATION_FORBIDDEN',

    PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
    PRODUCT_ALREADY_EXISTS: 'PRODUCT_ALREADY_EXISTS',
    INVALID_PRODUCT_DATA: 'INVALID_PRODUCT_DATA',
    INVALID_PRODUCT_PRICE: 'INVALID_PRODUCT_PRICE',

    ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
    DELIVERY_NOT_FOUND: 'DELIVERY_NOT_FOUND',
    INVALID_ORDER_STATUS: 'INVALID_ORDER_STATUS',

    INVALID_MOCK_QUANTITY: 'INVALID_MOCK_QUANTITY',
    MOCKS_NOT_ALLOWED: 'MOCKS_NOT_ALLOWED',

    LOGGER_NOT_ALLOWED: 'LOGGER_NOT_ALLOWED',

    FILE_REQUIRED: 'FILE_REQUIRED',
    INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    INVALID_FILE_FIELD: 'INVALID_FILE_FIELD',
    INVALID_DOCUMENT_TYPE: 'INVALID_DOCUMENT_TYPE',
    FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
    INVALID_MULTIPART_DATA: 'INVALID_MULTIPART_DATA',

    PROOF_ALREADY_EXISTS: 'PROOF_ALREADY_EXISTS',

    INVALID_ID: 'INVALID_ID',
    INVALID_DATA: 'INVALID_DATA',
    DUPLICATE_RECORD: 'DUPLICATE_RECORD',
    DATABASE_ERROR: 'DATABASE_ERROR',
    ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
});

export const ERROR_DICTIONARY = Object.freeze({

    [ERROR_CODES.USER_NOT_FOUND]: {
        statusCode: 404,
        message: 'Usuario no encontrado'
    },

    [ERROR_CODES.USER_ALREADY_EXISTS]: {
        statusCode: 409,
        message: 'Este email ya se encuentra registrado'
    },

    [ERROR_CODES.INVALID_USER_DATA]: {
        statusCode: 400,
        message: 'Los datos del usuario no son válidos'
    },

    [ERROR_CODES.ADMIN_CREATION_FORBIDDEN]: {
        statusCode: 400,
        message: 'No es posible crear administradores desde este endpoint'
    },

    [ERROR_CODES.PRODUCT_NOT_FOUND]: {
        statusCode: 404,
        message: 'Producto no encontrado'
    },

    [ERROR_CODES.PRODUCT_ALREADY_EXISTS]: {
        statusCode: 409,
        message: 'El código del producto ya existe'
    },

    [ERROR_CODES.INVALID_PRODUCT_DATA]: {
        statusCode: 400,
        message: 'Los datos del producto no son válidos'
    },

    [ERROR_CODES.INVALID_PRODUCT_PRICE]: {
        statusCode: 400,
        message: 'El precio del producto no es válido'
    },

    [ERROR_CODES.ORDER_NOT_FOUND]: {
        statusCode: 404,
        message: 'Pedido no encontrado'
    },

    [ERROR_CODES.DELIVERY_NOT_FOUND]: {
        statusCode: 404,
        message: 'Entrega no encontrada'
    },

    [ERROR_CODES.INVALID_ORDER_STATUS]: {
        statusCode: 400,
        message: 'El estado del pedido no es válido'
    },

    [ERROR_CODES.INVALID_MOCK_QUANTITY]: {
        statusCode: 400,
        message: 'La cantidad de mocks debe ser un número entero positivo'
    },

    [ERROR_CODES.MOCKS_NOT_ALLOWED]: {
        statusCode: 403,
        message: 'La generación de datos solo está disponible en desarrollo y testing'
    },

    [ERROR_CODES.LOGGER_NOT_ALLOWED]: {
        statusCode: 403,
        message: 'La prueba de logging solo está disponible en desarrollo y testing'
    },

    [ERROR_CODES.FILE_REQUIRED]: {
        statusCode: 400,
        message: 'Es obligatorio adjuntar un archivo'
    },

    [ERROR_CODES.INVALID_FILE_TYPE]: {
        statusCode: 415,
        message: 'El tipo de archivo no está permitido'
    },

    [ERROR_CODES.FILE_TOO_LARGE]: {
        statusCode: 413,
        message: 'El archivo supera el tamaño máximo permitido'
    },

    [ERROR_CODES.INVALID_FILE_FIELD]: {
        statusCode: 400,
        message: 'El campo utilizado para cargar el archivo no es válido'
    },

    [ERROR_CODES.INVALID_DOCUMENT_TYPE]: {
        statusCode: 400,
        message: 'El tipo de documento proporcionado no es válido'
    },

    [ERROR_CODES.FILE_UPLOAD_ERROR]: {
        statusCode: 500,
        message: 'Ocurrió un error al guardar el archivo'
    },

    [ERROR_CODES.INVALID_MULTIPART_DATA]: {
        statusCode: 400,
        message: 'Los datos de carga multipart/form-data no son válidos'
    },
[ERROR_CODES.PROOF_ALREADY_EXISTS]: {
    statusCode: 409,
    message: 'La entrega ya tiene un comprobante asociado'
},

    [ERROR_CODES.INVALID_ID]: {
        statusCode: 400,
        message: 'El identificador proporcionado no es válido'
    },

    [ERROR_CODES.INVALID_DATA]: {
        statusCode: 400,
        message: 'Los datos proporcionados no son válidos'
    },

    [ERROR_CODES.DUPLICATE_RECORD]: {
        statusCode: 409,
        message: 'Ya existe un registro con esos datos'
    },

    [ERROR_CODES.DATABASE_ERROR]: {
        statusCode: 500,
        message: 'Error al realizar una operación en la base de datos'
    },

    [ERROR_CODES.ROUTE_NOT_FOUND]: {
        statusCode: 404,
        message: 'La ruta solicitada no existe'
    },

    [ERROR_CODES.INTERNAL_ERROR]: {
        statusCode: 500,
        message: 'Error interno del servidor'
    }
});
