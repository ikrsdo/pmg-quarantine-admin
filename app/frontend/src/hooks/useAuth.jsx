import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authApi from '../api/auth';
import { ApiError } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authApi
      .fetchMe()
      .then((res) => setUser(res.username))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await authApi.login(username, password);
    setUser(res.username);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  // Any API call elsewhere can report a 401 here to drop back to the login
  // screen (e.g. an expired PMG ticket discovered mid-session).
  const handleUnauthorized = useCallback((err) => {
    if (err instanceof ApiError && err.status === 401) {
      setUser(null);
      return true;
    }
    return false;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, handleUnauthorized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
