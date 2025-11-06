import api from '../axios.config';

export const profileService = {
  // Geocode address without saving to profile (for one-time orders)
  geocodeAddress: async (addressData) => {
    const response = await api.post('/profile/geocode', addressData);
    return response.data;
  },
  
  // Update and save address to user profile
  updateAddress: async (addressData) => {
    const response = await api.post('/profile/address', addressData);
    return response.data;
  },
};
