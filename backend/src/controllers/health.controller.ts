import type { Request, Response } from 'express';
import { checkDatabase } from '../services/health.service.js';

/** GET /api/health — 200 when the API and the database respond, 503 otherwise. */
export async function show(_req: Request, res: Response) {
  const database = await checkDatabase();
  res.set('Cache-Control', 'no-store');
  res.status(database ? 200 : 503).json({ data: { status: database ? 'ok' : 'degraded', database: database ? 'up' : 'down' } });
}
