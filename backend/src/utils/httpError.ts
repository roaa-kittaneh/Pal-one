import type { ApiErrorBody } from '../../../shared/api.js';

type Code = ApiErrorBody['error']['code'];
type Details = { path: string; message: string }[];

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: Code,
    message: string,
    public readonly details?: Details,
  ) {
    super(message);
    this.name = 'HttpError';
  }

  static notFound(message = 'Resource not found') {
    return new HttpError(404, 'NOT_FOUND', message);
  }
}

export const errorBody = (status: number, code: Code, message: string, details?: Details): ApiErrorBody => ({
  error: { status, code, message, ...(details ? { details } : {}) },
});
