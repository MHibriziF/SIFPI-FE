import axios, { AxiosError, type AxiosResponse } from 'axios';
import { ApiError, type BaseResponse } from '@/shared/types/api';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  timeout: 30_000,
});

api.interceptors.response.use(
  response => response,
  (error: AxiosError<BaseResponse>) => {
    if (!error.response) {
      return Promise.reject(new ApiError(0, 'Network error. Please check your connection.'));
    }

    const { status, data } = error.response;

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
