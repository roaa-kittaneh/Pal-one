import { Router } from 'express';
import * as health from '../controllers/health.controller.js';
import * as statistics from '../controllers/statistics.controller.js';
import { apiNotFound } from '../middleware/errorHandler.js';
import { adminRoutes } from './admin.routes.js';
import { categoryRoutes } from './category.routes.js';
import { searchRoutes } from './search.routes.js';
import { serviceRoutes } from './service.routes.js';

/** Everything under /api. Public routes are read-only; admin routes live on their own prefix. */
export const apiRoutes = Router();

apiRoutes.use('/admin', adminRoutes);
apiRoutes.use('/categories', categoryRoutes);
apiRoutes.use('/services', serviceRoutes);
apiRoutes.use('/search', searchRoutes);
apiRoutes.get('/statistics', statistics.show);
apiRoutes.get('/health', health.show);
apiRoutes.use(apiNotFound);
