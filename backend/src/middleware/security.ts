import cors from 'cors';
import type { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import type { Env } from '../config/env.js';
import { errorBody } from '../utils/httpError.js';

/** Security headers (CSP, nosniff, frame-ancestors, …). Defaults allow Google Fonts over https. */
export const securityHeaders = (): RequestHandler => helmet();

/** CORS for the read-only public API: configured origins, GET only. */
export const apiCors = (origins: Env['CORS_ORIGIN']): RequestHandler =>
  cors({ origin: origins, methods: ['GET', 'HEAD', 'OPTIONS'], maxAge: 600 });

/** Per-IP rate limit (in-memory store: suitable for a single server instance). */
export const apiRateLimit = (perMinute: number): RequestHandler =>
  rateLimit({
    windowMs: 60_000,
    limit: perMinute,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) =>
      res
        .status(429)
        .set('Cache-Control', 'no-store')
        .json(errorBody(429, 'RATE_LIMITED', 'Too many requests. Please slow down and try again shortly.')),
  });
