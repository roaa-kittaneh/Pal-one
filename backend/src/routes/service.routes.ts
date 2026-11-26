import { Router } from 'express';
import * as services from '../controllers/service.controller.js';
import { validate } from '../middleware/validate.js';
import { limitQuery, slugParams } from '../validators/common.validators.js';
import { serviceListQuery } from '../validators/service.validators.js';

export const serviceRoutes = Router();

// Static paths are registered before /:slug so "featured" / "recent" are not treated as slugs.
serviceRoutes.get('/', validate('query', serviceListQuery), services.list);
serviceRoutes.get('/featured', validate('query', limitQuery), services.featured);
serviceRoutes.get('/recent', validate('query', limitQuery), services.recent);
serviceRoutes.get('/:slug', validate('params', slugParams), services.detail);
