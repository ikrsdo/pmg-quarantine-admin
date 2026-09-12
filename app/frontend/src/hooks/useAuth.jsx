import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authApi from '../api/auth';
import { ApiError } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(() => {
    return authApi
      .fetchMe()
      .then((res) => {
        setUser(res.username);
        setDemoMode(!!res.demoMode);
      })
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    checkSession().finally(() => setIsLoading(false));
  }, [checkSession]);

  // A backgrounded mobile PWA isn't unmounted when reopened (iOS suspends
  // rather than kills it), so this effect's mount-only check above doesn't
  // rerun on its own - without this, a ticket that expired while
  // backgrounded would only be discovered whenever some page's data query
  // next happened to run (which auto-refresh/refetchOnWindowFocus being
  // off can delay indefinitely). Re-check immediately whenever the app
  // regains visibility instead of waiting for that.
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkSession]);

  const login = useCallback(async (username, password) => {
    const res = await authApi.login(username, password);
    setUser(res.username);
    setDemoMode(!!res.demoMode);
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
    <AuthContext.Provider value={{ user, demoMode, isLoading, login, logout, handleUnauthorized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
