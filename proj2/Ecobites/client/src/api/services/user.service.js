import api from '../axios.config';

export const userService = {
  getProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateProfile: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  updateDriverAvailability: async (driverId, isAvailable) => {
    const response = await api.patch(`/users/${driverId}/availability`, { isAvailable });
    return response.data;
  },
};