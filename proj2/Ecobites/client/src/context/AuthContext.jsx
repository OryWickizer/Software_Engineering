import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data?.user) {
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const updated = await authService.fetchMe();
      if (updated) setUser(updated);
      return updated;
    } catch (e) {
      // if token invalid, logout
      console.error('Failed to refresh user', e);
      return null;
    }
  };

  const value = {
    user,
    setUser,
    isAuthenticated: authService.isAuthenticated(),
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
