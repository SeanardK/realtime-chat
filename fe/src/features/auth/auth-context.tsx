'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi, Profile } from './api';
import { tokenStore } from './token-store';

interface AuthContextValue {
  user: Profile | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      if (tokenStore.getRefresh()) {
        try {
          setUser(await authApi.me());
        } catch {
          tokenStore.clear();
        }
      }
      setReady(true);
    };
    void bootstrap();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const pair = await authApi.login(email, password);
    tokenStore.setPair(pair.accessToken, pair.refreshToken);
    setUser(await authApi.me());
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      const pair = await authApi.register(email, password, displayName);
      tokenStore.setPair(pair.accessToken, pair.refreshToken);
      setUser(await authApi.me());
    },
    [],
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, register, logout }),
    [user, ready, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
