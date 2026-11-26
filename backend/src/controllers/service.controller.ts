import type { Request, Response } from 'express';
import type { ServiceCollectionResponse, ServiceDetailResponse, ServiceListResponse } from '../../../shared/api.js';
import { parsed } from '../middleware/validate.js';
import { getFeaturedServices, getRecentServices, getServiceBySlug, listServices } from '../services/service.service.js';
import { HttpError } from '../utils/httpError.js';
import type { ServiceListQuery } from '../validators/service.validators.js';

/** GET /api/services — also serves GET /api/search (same filters, `q` required by its validator). */
export async function list(_req: Request, res: Response<ServiceListResponse>) {
  res.json(await listServices(parsed<ServiceListQuery>(res, 'query')));
}

/** GET /api/services/featured */
export async function featured(_req: Request, res: Response<ServiceCollectionResponse>) {
  const { limit } = parsed<{ limit: number }>(res, 'query');
  res.json({ data: await getFeaturedServices(limit) });
}

/** GET /api/services/recent */
export async function recent(_req: Request, res: Response<ServiceCollectionResponse>) {
  const { limit } = parsed<{ limit: number }>(res, 'query');
  res.json({ data: await getRecentServices(limit) });
}

/** GET /api/services/:slug */
export async function detail(_req: Request, res: Response<ServiceDetailResponse>) {
  const { slug } = parsed<{ slug: string }>(res, 'params');
  const result = await getServiceBySlug(slug);
  if (!result) throw HttpError.notFound(`Service "${slug}" was not found`);
  res.json({ data: result.service, related: result.related });
}
