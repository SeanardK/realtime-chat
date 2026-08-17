import { apiClient } from '@/shared/api/client';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export const authApi = {
  register(email: string, password: string, displayName: string) {
    return apiClient.public<TokenPair>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
  },
  login(email: string, password: string) {
    return apiClient.public<TokenPair>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  me() {
    return apiClient.request<Profile>('/users/me');
  },
};
