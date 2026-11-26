import type { ApiErrorBody } from '../../../shared/api';

/**
 * Base URL of the PAL-ONE API. Configure with VITE_API_BASE_URL; in
 * development the default "/api" is proxied to the Express server by Vite.
 * Only public, read-only endpoints are called from the browser — no secrets.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
  get isNotFound() {
    return this.status === 404;
  }
}

type Params = Record<string, string | number | boolean | string[] | null | undefined>;

/** Build "?a=1&b=x" skipping empty values; arrays become comma lists. */
export function toQuery(params: Params = {}): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) continue;
    sp.set(k, Array.isArray(v) ? v.join(',') : String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

/** GET a JSON endpoint. Non-2xx responses and network failures throw ApiError. */
export async function apiGet<T>(path: string, init?: { signal?: AbortSignal }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { headers: { Accept: 'application/json' }, signal: init?.signal });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the PAL-ONE API.');
  }

  const body = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const e = (body as ApiErrorBody | null)?.error;
    throw new ApiError(res.status, e?.code ?? 'HTTP_ERROR', e?.message ?? `Request failed (${res.status})`);
  }
  return body as T;
}
