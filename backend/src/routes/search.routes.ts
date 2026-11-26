import { Router } from 'express';
import * as services from '../controllers/service.controller.js';
import { validate } from '../middleware/validate.js';
import { searchQuery } from '../validators/service.validators.js';

export const searchRoutes = Router();

searchRoutes.get('/', validate('query', searchQuery), services.list);
