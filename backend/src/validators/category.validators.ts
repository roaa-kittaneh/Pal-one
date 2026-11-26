import { z } from 'zod';
import { single } from './common.validators.js';

/** GET /api/categories/:slug — how many of the category's services to embed (0 = none). */
export const categoryDetailQuery = z.object({
  servicesLimit: single(z.coerce.number().int().min(0).max(100).default(100)),
});
export type CategoryDetailQuery = z.infer<typeof categoryDetailQuery>;
