import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/services/auth.service';

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect based on role
      const role = data.user.role;
      if (role === 'customer') navigate('/');
      else if (role === 'restaurant') navigate('/restaurant/dashboard');
      else if (role === 'driver') navigate('/driver/dashboard');
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
      
      const role = data.user.role;
      if (role === 'customer') navigate('/');
      else if (role === 'restaurant') navigate('/restaurant/dashboard');
      else if (role === 'driver') navigate('/driver/dashboard');
    },
  });

  const logout = () => {
    authService.logout();
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