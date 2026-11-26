import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LOCATIONS, SERVICE_TYPES, SORT_OPTIONS } from '../../../shared/constants';
import type { LocationId, ServiceType, SortOption } from '../types';

/**
 * Filter state kept in the URL (?q=&category=&sub=&type=&location=&sort=&page=).
 * `category` and `sub` hold slugs, which the API accepts directly.
 * so results are shareable and survive reloads / back navigation.
 */
export function useUrlFilters() {
  const [params, setParams] = useSearchParams();

  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const sub = params.get('sub') ?? '';
  const types = (params.get('type') ?? '')
    .split(',')
    .filter((t): t is ServiceType => (SERVICE_TYPES as readonly string[]).includes(t));
  const locParam = params.get('location') ?? '';
  const location: LocationId | '' = (LOCATIONS as readonly string[]).includes(locParam) ? (locParam as LocationId) : '';
  const sortParam = params.get('sort') as SortOption;
  const sort: SortOption = SORT_OPTIONS.includes(sortParam) ? sortParam : 'recommended';
  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1);

  /** Patch params. Any change other than `page` resets pagination. */
  const update = useCallback(
    (patch: Record<string, string | null>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v === null || v === '' || (k === 'sort' && v === 'recommended') || (k === 'page' && v === '1')) next.delete(k);
            else next.set(k, v);
          }
          if (!('page' in patch)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const clear = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams]);

  const hasFilters = Boolean(q || category || sub || types.length || location);

  return { q, category, sub, types, location, sort, page, update, clear, hasFilters, params };
}
