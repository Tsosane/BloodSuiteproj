// src/services/requestService.js
import api from './api';

const requestService = {
  getAllRequests: async (params = {}) => {
    const response = await api.get('/requests', { params });
    return response;
  },

  submitRequest: async (data) => {
    const response = await api.post('/requests', data);
    return response;
  },

  updateRequestStatus: async (id, status) => {
    const response = await api.put(`/requests/${id}/status`, { status });
    return response;
  },

  fulfillRequest: async (id) => {
    const response = await api.put(`/requests/${id}/fulfill`);
    return response;
  },

  cancelRequest: async (id) => {
    const response = await api.delete(`/requests/${id}`);
    return response;
  },
};

export default requestService;