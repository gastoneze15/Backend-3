
import mocksService from '../services/mocksService.js';

class MocksController {

    async getUsers(req, res, next) {
        try {
            const quantity = req.query.quantity ?? 10;

            const users = mocksService.getUsers(quantity);

            const safeUsers = users.map(({ password, ...user }) => user);

            return res.status(200).json({
                status: 'success',
                payload: safeUsers
            });
        } catch (error) {
            next(error);
        }
    }

    async getDrivers(req, res, next) {
        try {
            const quantity = req.query.quantity ?? 10;

            const drivers = mocksService.getDrivers(quantity);

            const safeDrivers = drivers.map(({ password, ...driver }) => driver);

            return res.status(200).json({
                status: 'success',
                payload: safeDrivers
            });
        } catch (error) {
            next(error);
        }
    }


    async generateData(req, res, next) {
        try {
            const result = await mocksService.generateData(req.body);

            return res.status(201).json({
                status: 'success',
                message: 'Datos de prueba generados correctamente',
                payload: result
            });
        } catch (error) {
            next(error);
        }
    }

}

export default new MocksController();
