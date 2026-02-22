export interface BaseResponse<T = unknown> {
  status: number;
  message: string;
  timestamp: string;
  data: T;
}

/**
 * Structured error thrown by the API layer.
 * Always contains the backend's message and status when available.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly timestamp: string | null;

  constructor(status: number, message: string, timestamp?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.timestamp = timestamp ?? null;
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
