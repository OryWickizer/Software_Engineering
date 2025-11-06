import  api  from '../axios.config';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    // Token is now in httpOnly cookie, just return user data
    return response.data;
  },

  logout: async () => {
    // Call backend to clear the cookie
    await api.post('/auth/logout');
  },

  fetchMe: async () => {
    const response = await api.get('/auth/me');
    return response.data?.user;
  },
};