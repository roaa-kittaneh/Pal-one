import { z } from 'zod';
import { LOCATIONS, PAGE_SIZE_MAX, SERVICE_TYPES, SORT_OPTIONS } from '../../../shared/constants.js';
import { single, slugSchema } from './common.validators.js';

const searchText = z
  .string()
  .trim()
  .max(100, 'Search query must be 100 characters or fewer')
  // Strip control characters; the value is only ever used as a bound parameter.
  .transform((v) => v.replace(/[\u0000-\u001f\u007f]/g, ''));

/** `type=website,mobile-app` or `type=website&type=mobile-app`. */
const serviceTypeList = z.preprocess(
  (v) => {
    if (v === undefined || v === '') return undefined;
    const raw = Array.isArray(v) ? v.join(',') : String(v);
    // Cap the raw input before splitting so oversized values are rejected cheaply.
    if (raw.length > 100) return raw;
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  },
  z.array(z.enum(SERVICE_TYPES), 'type must be a comma-separated list of service types').max(SERVICE_TYPES.length).optional(),
);

const booleanFlag = single(z.enum(['true', 'false']).transform((v) => v === 'true').optional());

/** GET /api/services */
export const serviceListQuery = z.object({
  q: single(searchText.optional()),
  category: single(slugSchema.optional()),
  subcategory: single(slugSchema.optional()),
  type: serviceTypeList,
  location: single(z.enum(LOCATIONS).optional()),
  featured: booleanFlag,
  sort: single(z.enum(SORT_OPTIONS).default('recommended')),
  /** Language used for alphabetical sorting. */
  lang: single(z.enum(['ar', 'en']).default('ar')),
  page: single(z.coerce.number().int('page must be an integer').min(1).max(10_000).default(1)),
  pageSize: single(z.coerce.number().int().min(1).max(PAGE_SIZE_MAX).default(12)),
});
export type ServiceListQuery = z.infer<typeof serviceListQuery>;

/** GET /api/search — same filters, but `q` is required. */
export const searchQuery = serviceListQuery.extend({
  q: single(searchText.pipe(z.string().min(1, 'Search query "q" is required'))),
});
