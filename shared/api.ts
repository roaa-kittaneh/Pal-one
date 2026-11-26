/**
 * Public REST API contract shared by the Express server and the React client.
 * Every successful response is `{ data, ... }`; every error is `ApiErrorBody`.
 */
import type {
  CategoryIcon,
  CategoryTint,
  LocationId,
  ServiceLanguage,
  ServiceType,
} from './constants.js';

export interface CategorySummary {
  slug: string;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  icon: CategoryIcon;
  tint: CategoryTint;
}

export interface SubcategoryDTO {
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  serviceCount: number;
}

export interface CategoryDTO extends CategorySummary {
  descriptionAr: string;
  descriptionEn: string;
  headlineAr: string;
  headlineEn: string;
  image: string | null;
  serviceCount: number;
  subcategories: SubcategoryDTO[];
}

export interface ServiceDTO {
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  logo: string | null;
  serviceType: ServiceType;
  location: LocationId;
  languages: ServiceLanguage[];
  isFeatured: boolean;
  isVerified: boolean;
  /** Seed / sample content — not a real listing. */
  isDemo: boolean;
  /** ISO timestamp the listing was added. */
  dateAdded: string;
  category: CategorySummary;
  subcategory: { slug: string; nameAr: string; nameEn: string } | null;
}

export interface ServiceHighlightDTO {
  titleAr: string;
  titleEn: string;
  textAr: string;
  textEn: string;
}

export interface ServiceDetailDTO extends ServiceDTO {
  officialWebsite: string | null;
  googlePlayUrl: string | null;
  appStoreUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  highlights: ServiceHighlightDTO[];
  updatedAt: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ServiceFacets {
  /** Result counts per category, ignoring the category & subcategory filters. */
  categories: { slug: string; count: number }[];
  /** Result counts per location, ignoring the location filter. */
  locations: { location: LocationId; count: number }[];
}

export interface ServiceListResponse {
  data: ServiceDTO[];
  pagination: Pagination;
  facets: ServiceFacets;
}

export interface CategoryListResponse {
  data: CategoryDTO[];
}

export interface CategoryDetailResponse {
  data: CategoryDTO & { services: ServiceDTO[] };
}

export interface ServiceDetailResponse {
  data: ServiceDetailDTO;
  related: ServiceDTO[];
}

export interface ServiceCollectionResponse {
  data: ServiceDTO[];
}

export interface Statistics {
  totalServices: number;
  totalCategories: number;
  totalSubcategories: number;
  totalVerified: number;
  lastUpdated: string | null;
}

export interface StatisticsResponse {
  data: Statistics;
}

export interface ApiErrorBody {
  error: {
    status: number;
    code: 'BAD_REQUEST' | 'VALIDATION_ERROR' | 'NOT_FOUND' | 'RATE_LIMITED' | 'FORBIDDEN' | 'INTERNAL_ERROR';
    message: string;
    details?: { path: string; message: string }[];
  };
}
