const REFRESH_KEY = 'chat.refreshToken';

let accessToken: string | null = null;

export const tokenStore = {
  getAccess(): string | null {
    return accessToken;
  },
  setAccess(token: string | null): void {
    accessToken = token;
  },
  getRefresh(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return window.localStorage.getItem(REFRESH_KEY);
  },
  setRefresh(token: string | null): void {
    if (typeof window === 'undefined') {
      return;
    }
    if (token) {
      window.localStorage.setItem(REFRESH_KEY, token);
    } else {
      window.localStorage.removeItem(REFRESH_KEY);
    }
  },
  setPair(access: string, refresh: string): void {
    this.setAccess(access);
    this.setRefresh(refresh);
  },
  clear(): void {
    this.setAccess(null);
    this.setRefresh(null);
  },
};
