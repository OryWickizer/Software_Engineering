import api from '../axios.config';

export const menuService = {
  getByRestaurant: async (restaurantId) => {
    const response = await api.get(`/menu/restaurant/${restaurantId}`);
    return response.data;
  },

  create: async (menuData) => {
    const response = await api.post('/menu', menuData);
    return response.data;
  },

  update: async (id, menuData) => {
    const response = await api.put(`/menu/${id}`, menuData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/menu/${id}`);
    return response.data;
  },

  toggleAvailability: async (id, isAvailable) => {
    const response = await api.patch(`/menu/${id}`, { isAvailable });
    return response.data;
  },
};
