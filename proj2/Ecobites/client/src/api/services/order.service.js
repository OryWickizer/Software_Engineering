import api from '../axios.config';

export const orderService = {
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getByRole: async (role, userId) => {
    const response = await api.get(`/orders/${role}/${userId}`);
    return response.data;
  },

  getById: async (orderId) => {
    const response = await api.get(`/orders/detail/${orderId}`);
    return response.data;
  },

  updateStatus: async (orderId, statusData) => {
    const response = await api.patch(`/orders/${orderId}/status`, statusData);
    return response.data;
  },

  getAvailableForDrivers: async () => {
    const response = await api.get('/orders/available/drivers');
    return response.data;
  },

  cancelOrder: async (orderId) => {
    const response = await api.patch(`/orders/${orderId}/status`, {
      status: 'CANCELLED',
      updatedBy: 'customer'
    });
    return response.data;
  },
};