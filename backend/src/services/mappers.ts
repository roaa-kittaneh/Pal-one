import type { Prisma } from '@prisma/client';
import type { CategorySummary, ServiceDetailDTO, ServiceDTO } from '../../../shared/api.js';
import type { CategoryIcon, CategoryTint, LocationId, ServiceLanguage, ServiceType } from '../../../shared/constants.js';

/**
 * Explicit `select`s: public responses only ever contain these columns, so
 * internal fields (searchText, status, sortOrder, ids) and other tables
 * (AdminUser) can never leak by accident.
 */
export const categorySummarySelect = {
  slug: true,
  nameAr: true,
  nameEn: true,
  taglineAr: true,
  taglineEn: true,
  icon: true,
  tint: true,
} satisfies Prisma.CategorySelect;

export const serviceCardSelect = {
  slug: true,
  nameAr: true,
  nameEn: true,
  descriptionAr: true,
  descriptionEn: true,
  logo: true,
  serviceType: true,
  location: true,
  isFeatured: true,
  isVerified: true,
  isDemo: true,
  createdAt: true,
  category: { select: categorySummarySelect },
  subcategory: { select: { slug: true, nameAr: true, nameEn: true } },
  languages: { select: { language: true }, orderBy: { language: 'asc' } },
} satisfies Prisma.ServiceSelect;

export const serviceDetailSelect = {
  ...serviceCardSelect,
  officialWebsite: true,
  googlePlayUrl: true,
  appStoreUrl: true,
  contactEmail: true,
  contactPhone: true,
  updatedAt: true,
  highlights: {
    select: { titleAr: true, titleEn: true, textAr: true, textEn: true },
    orderBy: { position: 'asc' },
  },
} satisfies Prisma.ServiceSelect;

type CardRow = Prisma.ServiceGetPayload<{ select: typeof serviceCardSelect }>;
type DetailRow = Prisma.ServiceGetPayload<{ select: typeof serviceDetailSelect }>;
type CategorySummaryRow = Prisma.CategoryGetPayload<{ select: typeof categorySummarySelect }>;

export const toCategorySummary = (c: CategorySummaryRow): CategorySummary => ({
  ...c,
  icon: c.icon as CategoryIcon,
  tint: c.tint as CategoryTint,
});

export const toServiceDTO = (s: CardRow): ServiceDTO => ({
  slug: s.slug,
  nameAr: s.nameAr,
  nameEn: s.nameEn,
  descriptionAr: s.descriptionAr,
  descriptionEn: s.descriptionEn,
  logo: s.logo,
  serviceType: s.serviceType as ServiceType,
  location: s.location as LocationId,
  languages: s.languages.map((l) => l.language as ServiceLanguage),
  isFeatured: s.isFeatured,
  isVerified: s.isVerified,
  isDemo: s.isDemo,
  dateAdded: s.createdAt.toISOString(),
  category: toCategorySummary(s.category),
  subcategory: s.subcategory,
});

export const toServiceDetailDTO = (s: DetailRow): ServiceDetailDTO => ({
  ...toServiceDTO(s),
  officialWebsite: s.officialWebsite,
  googlePlayUrl: s.googlePlayUrl,
  appStoreUrl: s.appStoreUrl,
  contactEmail: s.contactEmail,
  contactPhone: s.contactPhone,
  highlights: s.highlights,
  updatedAt: s.updatedAt.toISOString(),
});
