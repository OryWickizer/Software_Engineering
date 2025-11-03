import api from '../axios.config';

export const restaurantService = {
  getAll: async () => {
    const response = await api.get('/restaurants');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  },

  searchByCuisine: async (cuisine) => {
    const response = await api.get(`/restaurants?cuisine=${cuisine}`);
    return response.data;
  },
};
