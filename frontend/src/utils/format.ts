import type { Lang, ServiceDTO } from '../types';

/** "Recently added" badge: listed within the last `days` days. */
export function isRecentlyAdded(s: Pick<ServiceDTO, 'dateAdded'>, days = 45, now = Date.now()): boolean {
  return (now - Date.parse(s.dateAdded)) / 86_400_000 <= days;
}

export const serviceName = (s: Pick<ServiceDTO, 'nameAr' | 'nameEn'>, lang: Lang) => (lang === 'ar' ? s.nameAr : s.nameEn);
export const serviceDescription = (s: Pick<ServiceDTO, 'descriptionAr' | 'descriptionEn'>, lang: Lang) =>
  lang === 'ar' ? s.descriptionAr : s.descriptionEn;
