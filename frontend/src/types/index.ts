/**
 * Frontend types. Data shapes come from the shared API contract so the client
 * and server can't drift apart.
 */
export type {
  CategoryDTO,
  CategorySummary,
  Pagination,
  ServiceDetailDTO,
  ServiceDTO,
  Statistics,
  SubcategoryDTO,
} from '../../../shared/api';
export type {
  CategoryIcon,
  CategoryTint,
  LocationId,
  ServiceLanguage,
  ServiceType,
  SortOption,
} from '../../../shared/constants';

export type Lang = 'ar' | 'en';

/** A string available in both interface languages. */
export interface Localized {
  ar: string;
  en: string;
}

/** Any object with `<key>Ar` / `<key>En` fields, e.g. { nameAr, nameEn }. */
export type Bilingual<K extends string> = { [P in `${K}Ar` | `${K}En`]: string };
