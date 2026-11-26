import { Prisma } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { errorBody, HttpError } from '../utils/httpError.js';

/** 404 for any /api route that no router handled. */
export function apiNotFound(req: Request, res: Response) {
  res.status(404).set('Cache-Control', 'no-store').json(errorBody(404, 'NOT_FOUND', `No API endpoint for ${req.method} ${req.path}`));
}

/**
 * Central error handler. Known errors become clean JSON responses; anything
 * unexpected is logged server-side and returned as a generic 500 so that
 * stack traces, SQL or Prisma internals never reach the client.
 */
// Express identifies error handlers by their 4-argument signature.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  // Never let shared caches keep an error response.
  res.set('Cache-Control', 'no-store');

  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ path: i.path.join('.') || '(root)', message: i.message }));
    return res.status(400).json(errorBody(400, 'VALIDATION_ERROR', 'Invalid request parameters', details));
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json(errorBody(err.status, err.code, err.message, err.details));
  }

  // Malformed JSON body (express.json)
  if (err instanceof SyntaxError && 'status' in err && (err as { status?: number }).status === 400) {
    return res.status(400).json(errorBody(400, 'BAD_REQUEST', 'Malformed JSON body'));
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    return res.status(404).json(errorBody(404, 'NOT_FOUND', 'Resource not found'));
  }

  console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  return res.status(500).json(errorBody(500, 'INTERNAL_ERROR', 'Something went wrong. Please try again later.'));
}
