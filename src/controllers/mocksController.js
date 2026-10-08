
import mocksService from '../services/mocksService.js';

class MocksController {

    async getUsers(req, res, next) {
        try {
            const users = mocksService.getUsers(10);

            const safeUsers = users.map(({ password, ...user }) => user);

            res.status(200).json({
                status: 'success',
                payload: safeUsers
            });
        } catch (error) {
            next(error);
        }
    }



    async getDrivers(req, res, next) {
        try {
            const drivers = mocksService.getDrivers(10);

            const safeDrivers = drivers.map(({ password, ...driver }) => driver);

            res.status(200).json({
                status: 'success',
                payload: safeDrivers
            });
        } catch (error) {
            next(error);
        }
    }


    async generateData(req, res, next) {
        try {
            const result = await mocksService.generateData();

            res.status(201).json({
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
