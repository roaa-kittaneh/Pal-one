import type {
  CategoryDetailResponse,
  CategoryListResponse,
  ServiceCollectionResponse,
  ServiceDetailResponse,
  ServiceListResponse,
  StatisticsResponse,
} from '../../../shared/api';
import type { LocationId, ServiceType, SortOption } from '../../../shared/constants';
import { toQuery } from './apiClient';

/**
 * Typed endpoint paths. Each returns the request path; `useApi<T>(path)`
 * fetches it. The phantom generic keeps path and response type together.
 */
export type Endpoint<T> = string & { __response?: T };
const ep = <T,>(path: string) => path as Endpoint<T>;

export interface ServiceQuery {
  q?: string;
  category?: string;
  subcategory?: string;
  type?: ServiceType[];
  location?: LocationId | '';
  featured?: boolean;
  sort?: SortOption;
  lang?: 'ar' | 'en';
  page?: number;
  pageSize?: number;
}

/** Path builders for every public endpoint, grouped by resource. */
export const catalogApi = {
  categories: () => ep<CategoryListResponse>('/categories'),
  category: (slug: string, servicesLimit?: number) =>
    ep<CategoryDetailResponse>(`/categories/${encodeURIComponent(slug)}${toQuery({ servicesLimit })}`),
  services: (q: ServiceQuery) => ep<ServiceListResponse>(`/services${toQuery({ ...q })}`),
  featured: (limit = 3) => ep<ServiceCollectionResponse>(`/services/featured${toQuery({ limit })}`),
  recent: (limit = 3) => ep<ServiceCollectionResponse>(`/services/recent${toQuery({ limit })}`),
  service: (slug: string) => ep<ServiceDetailResponse>(`/services/${encodeURIComponent(slug)}`),
  search: (q: ServiceQuery & { q: string }) => ep<ServiceListResponse>(`/search${toQuery({ ...q })}`),
  statistics: () => ep<StatisticsResponse>('/statistics'),
};
