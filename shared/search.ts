import { normalize } from './text.js';

type Bilingual = { nameAr: string; nameEn: string };

/** The fields a service can be found by. */
export interface SearchableService extends Bilingual {
  descriptionAr: string;
  descriptionEn: string;
  category: Bilingual & { taglineAr: string; taglineEn: string };
  subcategory: Bilingual | null;
}

/**
 * Build the normalized `Service.searchText` column: names, descriptions,
 * category (name + tagline) and subcategory names in both languages.
 * Used by the backend search-index service and the database seed.
 */
export function buildServiceSearchText(s: SearchableService): string {
  return normalize(
    [
      s.nameAr,
      s.nameEn,
      s.descriptionAr,
      s.descriptionEn,
      s.category.nameAr,
      s.category.nameEn,
      s.category.taglineAr,
      s.category.taglineEn,
      s.subcategory?.nameAr,
      s.subcategory?.nameEn,
    ]
      .filter(Boolean)
      .join(' '),
  );
}
