import { tokenStore } from '@/features/auth/token-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const request = async <T>(
  path: string,
  options: RequestInit,
  withAuth: boolean,
): Promise<T> => {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (withAuth) {
    const access = tokenStore.getAccess();
    if (access) {
      headers.set('Authorization', `Bearer ${access}`);
    }
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const message = await response.text();
    throw new ApiError(response.status, message || response.statusText);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
};

const refreshTokens = async (): Promise<boolean> => {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) {
    return false;
  }
  try {
    const pair = await request<TokenPair>(
      '/auth/refresh',
      { method: 'POST', body: JSON.stringify({ refreshToken }) },
      false,
    );
    tokenStore.setPair(pair.accessToken, pair.refreshToken);
    return true;
  } catch {
    tokenStore.clear();
    return false;
  }
};

export const apiClient = {
  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    try {
      return await request<T>(path, options, true);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        const refreshed = await refreshTokens();
        if (refreshed) {
          return request<T>(path, options, true);
        }
      }
      throw error;
    }
  },
  public<T>(path: string, options: RequestInit = {}): Promise<T> {
    return request<T>(path, options, false);
  },
};
