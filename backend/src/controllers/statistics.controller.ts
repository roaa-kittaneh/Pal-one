import type { Request, Response } from 'express';
import type { StatisticsResponse } from '../../../shared/api.js';
import { getStatistics } from '../services/statistics.service.js';

/** GET /api/statistics */
export async function show(_req: Request, res: Response<StatisticsResponse>) {
  res.json({ data: await getStatistics() });
}
