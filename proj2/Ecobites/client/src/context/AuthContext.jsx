import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if user is authenticated by calling /me
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authService.fetchMe();
        setUser(userData);
      } catch (error) {
        // Not authenticated or token expired
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data?.user) {
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const updated = await authService.fetchMe();
      if (updated) setUser(updated);
      return updated;
    } catch (e) {
      console.error('Failed to refresh user', e);
      setUser(null);
      return null;
    }
  };

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

// NOTE: AuthContext also exports helpers/constants; keep in separate module if Fast Refresh issues arise
// Intentionally do not export the raw AuthContext object to avoid
// react-refresh "only-export-components" warnings. Consumers should
// use `useAuthContext` or `AuthProvider` instead.
