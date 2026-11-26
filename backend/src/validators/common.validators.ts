import { z } from 'zod';

/**
 * Query-string values arrive as string | string[] (repeated keys).
 * Scalar parameters use the first value; '' is treated as "not provided".
 */
export const single = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (Array.isArray(v) ? v[0] : v === '' ? undefined : v), schema);

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(100, 'Slug is too long')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may only contain lowercase letters, numbers and hyphens');

/** `:slug` route parameter. */
export const slugParams = z.object({ slug: slugSchema });

/** `?limit=` for small collections (featured, recent). */
export const limitQuery = z.object({
  limit: single(z.coerce.number().int().min(1).max(24).default(6)),
});
