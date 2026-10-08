
import { faker } from '@faker-js/faker';
import {
    USER_ROLES,
    ORDER_STATUS,
    DELIVERY_STATUS,
    DELIVERY_PRIORITY
} from '../constants/index.js';

export const generateMockUser = (role = USER_ROLES.CUSTOMER) => {
    return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email().toLowerCase(),
        password: faker.internet.password({ length: 12 }),
        role
    };
};

export const generateMockUsers = (quantity = 10) => {
    return Array.from(
        { length: quantity },
        () => generateMockUser()
    );
};

export const generateMockDrivers = (quantity = 10) => {
    return Array.from(
        { length: quantity },
        () => generateMockUser(USER_ROLES.DRIVER)
    );
};


export const generateMockOrder = (customerId) => {
    const items = Array.from(
        { length: faker.number.int({ min: 1, max: 4 }) },
        () => ({
            name: faker.commerce.productName(),
            quantity: faker.number.int({ min: 1, max: 5 }),
            price: Number(faker.commerce.price({ min: 1000, max: 20000 }))
        })
    );

    const total = items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
    );

    return {
        customer: customerId,
        items,
        deliveryAddress: faker.location.streetAddress(),
        total,
        shippingCost: faker.number.int({ min: 1000, max: 5000 }),
        declaredValue: total,
        status: ORDER_STATUS.CREATED,
        priority: DELIVERY_PRIORITY.NORMAL,
        delivery: null
    };
};

export const generateMockDelivery = (orderId, driverId = null) => {
    return {
        order: orderId,
        driver: driverId,
        status: driverId
            ? DELIVERY_STATUS.ASSIGNED
            : DELIVERY_STATUS.PENDING,
        priority: DELIVERY_PRIORITY.NORMAL,
        assignedAt: driverId ? new Date() : null,
        deliveredAt: null
    };
};
