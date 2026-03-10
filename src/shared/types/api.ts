export interface BaseResponse<T = unknown> {
  status: number;
  message: string;
  timestamp: string;
  data: T;
}

/**
 * Structured error thrown by the API layer.
 * Always contains the backend's message and status when available.
 *
 * NOTE: We override Symbol.hasInstance so that `instanceof ApiError` works
 * reliably even when the class is duplicated across bundler chunks
 * (common with Turbopack / Next.js dev mode).
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly timestamp: string | null;
  public readonly details: unknown;

  /** Make `instanceof` resilient to duplicate class copies across chunks. */
  static [Symbol.hasInstance](instance: unknown): instance is ApiError {
    return (
      instance instanceof Error &&
      (instance as Error).name === 'ApiError' &&
      'status' in (instance as object)
    );
  }

  constructor(status: number, message: string, timestamp?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.timestamp = timestamp ?? null;
    this.details = details ?? null;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isValidationError(): boolean {
    return this.status === 400;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }
}
