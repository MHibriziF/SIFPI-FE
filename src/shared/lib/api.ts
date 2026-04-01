import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { ApiError, type BaseResponse } from '@/shared/types/api';
import { setFlashToast } from '../hooks/use-flash-toast';

interface RetryableConfig extends InternalAxiosRequestConfig {
  _csrfRetried?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
export const api = axios.create({
  baseURL: API_BASE_URL,
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

async function ensureCsrfToken(): Promise<void> {
  if (document.cookie.split(';').some(c => c.trim().startsWith('XSRF-TOKEN='))) {
    csrfReady = true;
    return;
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
}

api.interceptors.request.use(async config => {
  config.url = normalizeApiUrl(config.url);

  const needsCsrf = !csrfReady && MUTATING.has(config.method?.toLowerCase() ?? '');
  if (needsCsrf) {
    await ensureCsrfToken();
  }

  return config;
});

api.interceptors.response.use(
  response => response,
  async (error: AxiosError<BaseResponse>) => {
    if (!error.response) {
      throw new ApiError(0, 'Network error. Please check your connection.');
    }

    const { status, data } = error.response;

    // 403 on a mutating request may mean a stale CSRF token. Auto-retry once:
    // re-fetch the token and replay the original request transparently.
    // The _csrfRetried flag prevents infinite loops; if the retry also 403s
    // it's a real permission denial and the error propagates normally.
    const config = error.config as RetryableConfig | undefined;
    if (
      status === 403 &&
      MUTATING.has(config?.method?.toLowerCase() ?? '') &&
      !config?._csrfRetried
    ) {
      csrfReady = false;
      await ensureCsrfToken();
      if (config) {
        config._csrfRetried = true;
        return api(config);
      }
    }

    // 401 means the session has expired. Redirect to root so the proxy enforces
    // the login wall. Skip auth endpoints — wrong credentials also produce 401
    // and should be handled by the form instead.
    const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password'];
    const url = error.config?.url ?? '';
    if (
      status === 401 &&
      typeof globalThis !== 'undefined' &&
      !AUTH_ENDPOINTS.some(path => url.includes(path))
    ) {
      setFlashToast({
        type: 'info',
        title: 'Session expired',
        description: 'Please log in again.',
      });
      globalThis.location.href = '/login';
    }

    throw new ApiError(
      status,
      data?.message ?? 'Unexpected error',
      data?.timestamp,
      data?.data ?? data
    );
  }
);

// ---------------------------------------------------------------------------
// Typed helpers – every call returns BaseResponse<T> directly
// ---------------------------------------------------------------------------
function normalizeApiUrl(url?: string): string | undefined {
  if (!url) return undefined;
  return url.startsWith('/') ? url : `/${url}`;
}
export async function apiGet<T>(
  url: string,
  params?: Record<string, unknown>
): Promise<BaseResponse<T>> {
  const res = await api.get<BaseResponse<T>>(normalizeApiUrl(url) ?? url, { params });
  return res.data;
}

export async function apiGetWithBody<T>(url: string, body?: unknown): Promise<BaseResponse<T>> {
  const res = await api.request<BaseResponse<T>>({
    method: 'GET',
    url: normalizeApiUrl(url) ?? url,
    data: body,
  });
  return res.data;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<BaseResponse<T>> {
  const res = await api.post<BaseResponse<T>>(normalizeApiUrl(url) ?? url, body);
  return res.data;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<BaseResponse<T>> {
  const res = await api.put<BaseResponse<T>>(normalizeApiUrl(url) ?? url, body);
  return res.data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<BaseResponse<T>> {
  const res = await api.patch<BaseResponse<T>>(normalizeApiUrl(url) ?? url, body);
  return res.data;
}

export async function apiPostFile<T>(url: string, body: FormData): Promise<BaseResponse<T>> {
  const res = await api.post<BaseResponse<T>>(normalizeApiUrl(url) ?? url, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function apiPutFile<T>(url: string, body: FormData): Promise<BaseResponse<T>> {
  const res = await api.put<BaseResponse<T>>(normalizeApiUrl(url) ?? url, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function apiPatchFile<T>(url: string, body: FormData): Promise<BaseResponse<T>> {
  const res = await api.patch<BaseResponse<T>>(normalizeApiUrl(url) ?? url, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function apiDelete<T>(url: string): Promise<BaseResponse<T>> {
  const res = await api.delete<BaseResponse<T>>(url);
  return res.data;
}
