import type { Request, Response } from 'express';
import type { CategoryDetailResponse, CategoryListResponse } from '../../../shared/api.js';
import { parsed } from '../middleware/validate.js';
import { getCategoryWithServices, listCategories } from '../services/category.service.js';
import { HttpError } from '../utils/httpError.js';
import type { CategoryDetailQuery } from '../validators/category.validators.js';

/** GET /api/categories */
export async function list(_req: Request, res: Response<CategoryListResponse>) {
  res.json({ data: await listCategories() });
}

/** GET /api/categories/:slug */
export async function detail(_req: Request, res: Response<CategoryDetailResponse>) {
  const { slug } = parsed<{ slug: string }>(res, 'params');
  const { servicesLimit } = parsed<CategoryDetailQuery>(res, 'query');
  const category = await getCategoryWithServices(slug, servicesLimit);
  if (!category) throw HttpError.notFound(`Category "${slug}" was not found`);
  res.json({ data: category });
}
