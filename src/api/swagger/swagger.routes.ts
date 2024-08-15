import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../../docs/swagger';

export const router = Router();

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
