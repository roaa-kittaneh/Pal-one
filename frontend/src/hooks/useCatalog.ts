/**
 * Domain data hooks. Pages use these instead of building API requests
 * themselves; every request goes through services/apiClient.ts.
 */
import { catalogApi, type ServiceQuery } from '../services/catalogApi';
import { useApi } from './useApi';

export const useCategories = () => useApi(catalogApi.categories());

/** One category (404 → `error.isNotFound`). Pass servicesLimit=0 when only the category itself is needed. */
export const useCategory = (slug: string, servicesLimit?: number) => useApi(catalogApi.category(slug, servicesLimit));

export const useServices = (query: ServiceQuery) => useApi(catalogApi.services(query));

export const useFeaturedServices = (limit = 3) => useApi(catalogApi.featured(limit));

export const useRecentServices = (limit = 3) => useApi(catalogApi.recent(limit));

export const useService = (slug: string) => useApi(catalogApi.service(slug));

/** Search; pass an empty query to skip the request. */
export const useSearch = (query: ServiceQuery & { q: string }) => useApi(query.q ? catalogApi.search(query) : null);

export const useStatistics = () => useApi(catalogApi.statistics());
