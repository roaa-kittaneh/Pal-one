import type { RequestHandler } from 'express';

/**
 * Short shared cache for successful public GETs (the catalog changes rarely).
 * Error responses override this with `no-store` (see errorHandler / apiNotFound / rate limit).
 */
export const publicCache =
  (maxAgeSeconds = 30): RequestHandler =>
  (req, res, next) => {
    if (req.method === 'GET') res.set('Cache-Control', `public, max-age=${maxAgeSeconds}`);
    next();
  };
