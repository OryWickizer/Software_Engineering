import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/services/auth.service';

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
};