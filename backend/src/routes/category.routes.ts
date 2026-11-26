import { Router } from 'express';
import * as categories from '../controllers/category.controller.js';
import { validate } from '../middleware/validate.js';
import { categoryDetailQuery } from '../validators/category.validators.js';
import { slugParams } from '../validators/common.validators.js';

export const categoryRoutes = Router();

categoryRoutes.get('/', categories.list);
categoryRoutes.get('/:slug', validate('params', slugParams), validate('query', categoryDetailQuery), categories.detail);
