import axios, { AxiosError, type AxiosResponse } from 'axios';
import { ApiError, type BaseResponse } from '@/shared/types/api';

export const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  timeout: 30_000,
});

// ---------------------------------------------------------------------------
// CSRF bootstrap interceptor
// Spring Security sets XSRF-TOKEN on GET responses but rejects mutating
// requests without it. On first visit the cookie doesn't exist yet, so we
// fetch it transparently before the first POST/PUT/PATCH/DELETE.
//
// csrfReady: cached flag — once true, the interceptor is essentially free.
// csrfInit:  shared promise so concurrent requests don't fire multiple GETs.
// ---------------------------------------------------------------------------
const MUTATING = new Set(['post', 'put', 'patch', 'delete']);
let csrfReady = false;
let csrfInit: Promise<void> | null = null;

api.interceptors.request.use(async config => {
  if (csrfReady || !MUTATING.has(config.method?.toLowerCase() ?? '')) return config;

  if (document.cookie.split(';').some(c => c.trim().startsWith('XSRF-TOKEN='))) {
    csrfReady = true;
    return config;
  }

  csrfInit ??= api
    .get('api/csrf')
    .then(() => {
      csrfReady = true;
    })
    .catch(() => {})
    .finally(() => {
      csrfInit = null;
    });

  await csrfInit;
  return config;
});

api.interceptors.response.use(
  response => response,
  (error: AxiosError<BaseResponse>) => {
    if (!error.response) {
      return Promise.reject(new ApiError(0, 'Network error. Please check your connection.'));
    }

    const { status, data } = error.response;

    // If a mutating request gets a 401, the CSRF token may have gone stale.
    // Reset so the next request re-bootstraps rather than failing silently.
    if (status === 401 && MUTATING.has(error.config?.method?.toLowerCase() ?? '')) {
      csrfReady = false;
    }

    return Promise.reject(
      new ApiError(status, data?.message ?? 'Unexpected error', data?.timestamp)
    );
  }
);

// ---------------------------------------------------------------------------
// Typed helpers – every call returns BaseResponse<T> directly
// ---------------------------------------------------------------------------
export async function apiGet<T>(
  url: string,
  params?: Record<string, unknown>
): Promise<BaseResponse<T>> {
  const res = await api.get<BaseResponse<T>>(url, { params });
  return res.data;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<BaseResponse<T>> {
  const res = await api.post<BaseResponse<T>>(url, body);
  return res.data;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<BaseResponse<T>> {
  const res = await api.put<BaseResponse<T>>(url, body);
  return res.data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<BaseResponse<T>> {
  const res = await api.patch<BaseResponse<T>>(url, body);
  return res.data;
}

export async function apiPostFile<T>(url: string, body: FormData): Promise<BaseResponse<T>> {
  const res = await api.post<BaseResponse<T>>(url, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function apiPutFile<T>(url: string, body: FormData): Promise<BaseResponse<T>> {
  const res = await api.put<BaseResponse<T>>(url, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function apiPatchFile<T>(url: string, body: FormData): Promise<BaseResponse<T>> {
  const res = await api.patch<BaseResponse<T>>(url, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function apiDelete<T>(url: string): Promise<BaseResponse<T>> {
  const res = await api.delete<BaseResponse<T>>(url);
  return res.data;
}
