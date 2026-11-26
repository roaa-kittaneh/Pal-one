/** Allowed values for TEXT columns that behave like enums (SQLite has no enum type). */

export const SERVICE_TYPES = ['website', 'mobile-app', 'website-and-app'] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const LOCATIONS = [
  'nationwide',
  'jerusalem',
  'ramallah',
  'birzeit',
  'nablus',
  'bethlehem',
  'hebron',
  'jenin',
  'gaza',
] as const;
export type LocationId = (typeof LOCATIONS)[number];

export const SERVICE_LANGUAGES = ['ar', 'en'] as const;
export type ServiceLanguage = (typeof SERVICE_LANGUAGES)[number];

export const SERVICE_STATUSES = ['draft', 'published', 'archived'] as const;
export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

export const CATEGORY_ICONS = [
  'finance',
  'education',
  'telecom',
  'shopping',
  'health',
  'business',
  'public',
  'travel',
  'transport',
  'employment',
] as const;
export type CategoryIcon = (typeof CATEGORY_ICONS)[number];

export const CATEGORY_TINTS = ['mist', 'lavender', 'sky', 'sand', 'blush', 'mint'] as const;
export type CategoryTint = (typeof CATEGORY_TINTS)[number];

export const SORT_OPTIONS = ['recommended', 'recent', 'alphabetical'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const ADMIN_ROLES = ['admin', 'editor'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const PAGE_SIZE_MAX = 50;
