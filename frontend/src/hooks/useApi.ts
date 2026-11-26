import { useCallback, useEffect, useState } from 'react';
import { ApiError, apiGet } from '../services/apiClient';
import type { Endpoint } from '../services/catalogApi';

/** In-memory response cache shared by all hooks (stale-while-revalidate, LRU-capped). */
const MAX_CACHE_ENTRIES = 100;
const cache = new Map<string, unknown>();
function remember(key: string, value: unknown) {
  cache.delete(key);
  cache.set(key, value);
  if (cache.size > MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value!);
}

export interface ApiState<T> {
  data: T | undefined;
  error: ApiError | undefined;
  /** True while a request is in flight (data may still hold the previous result). */
  loading: boolean;
  retry: () => void;
}

/**
 * Low-level fetch hook used by the domain hooks in useCatalog.ts.
 * Re-fetches when the path changes; `null` skips. Previous data is kept while
 * the next request loads (no flashing on filter changes); stale requests are aborted.
 */
export function useApi<T>(path: Endpoint<T> | null): ApiState<T> {
  const [state, setState] = useState<Omit<ApiState<T>, 'retry'>>(() => ({
    data: path ? (cache.get(path) as T | undefined) : undefined,
    error: undefined,
    loading: Boolean(path),
  }));
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!path) {
      setState({ data: undefined, error: undefined, loading: false });
      return;
    }
    const controller = new AbortController();
    setState((s) => ({ data: (cache.get(path) as T | undefined) ?? s.data, error: undefined, loading: true }));
    apiGet<T>(path, { signal: controller.signal })
      .then((data) => {
        remember(path, data);
        setState({ data, error: undefined, loading: false });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const error = err instanceof ApiError ? err : new ApiError(0, 'UNKNOWN', String(err));
        setState((s) => ({ data: error.isNotFound ? undefined : s.data, error, loading: false }));
      });
    return () => controller.abort();
  }, [path, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}
