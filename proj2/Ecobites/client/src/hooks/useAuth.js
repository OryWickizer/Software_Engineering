import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/services/auth.service';
import { useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthContext();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // update context user so components depending on auth get updated
      try { setUser && setUser(data.user); } catch (e) { /* ignore if not available */ }

      // Redirect based on role
      const role = data.user.role;
      if (role === 'customer') navigate('/');
      else if (role === 'restaurant') navigate('/restaurants');
      else if (role === 'driver') navigate('/driver');
    },
    onError: (error) => {
      // Just log it, don't throw - React Query handles the error state
      console.error('Login failed:', error.response?.data?.error || error.message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      try { setUser && setUser(data.user); } catch (e) { /* ignore if not available */ }

      const role = data.user.role;
      if (role === 'customer') navigate('/');
      else if (role === 'restaurant') navigate('/restaurants');
      else if (role === 'driver') navigate('/driver');
    },
  });

  const logout = () => {
    authService.logout();
    try { setUser && setUser(null); } catch (e) {}
    queryClient.clear();
    navigate('/login');
  };

  return {
    user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
};