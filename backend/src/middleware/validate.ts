import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';

/**
 * Validate req.query / req.params with a Zod schema. The parsed (typed,
 * coerced) value is stored on res.locals because Express 5 makes req.query
 * read-only. Validation errors are forwarded to the central error handler.
 */
export const validate =
  <T extends z.ZodTypeAny>(source: 'query' | 'params', schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    res.locals[source] = result.data;
    next();
  };

/** Typed accessor for values stored by `validate`. */
export const parsed = <T>(res: Response, source: 'query' | 'params') => res.locals[source] as T;
