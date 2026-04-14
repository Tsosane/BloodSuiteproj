// src/services/inventoryService.js
import api from './api';

const inventoryService = {
  getAllInventory: async (params = {}) => {
    const response = await api.get('/inventory', { params });
    return response;
  },

  addBloodUnit: async (data) => {
    const response = await api.post('/inventory', data);
    return response;
  },

  updateBloodUnit: async (id, data) => {
    const response = await api.put(`/inventory/${id}`, data);
    return response;
  },

  deleteBloodUnit: async (id) => {
    const response = await api.delete(`/inventory/${id}`);
    return response;
  },

  getExpiringUnits: async () => {
    const response = await api.get('/inventory/expiring');
    return response;
  },

  getLowStockUnits: async (threshold = 5) => {
    const response = await api.get(`/inventory/low-stock?threshold=${threshold}`);
    return response;
  },
};

export default inventoryService;