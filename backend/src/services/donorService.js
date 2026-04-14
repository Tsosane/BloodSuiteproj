// src/services/donorService.js
import api from './api';

const donorService = {
  getMyProfile: async () => {
    const response = await api.get('/donors/me');
    return response;
  },

  updateDonorProfile: async (data) => {
    const response = await api.put('/donors/me', data);
    return response;
  },

  getNearbyDonors: async (hospitalId, radiusKm = 10, bloodType = null) => {
    const params = { hospitalId, radiusKm };
    if (bloodType) params.bloodType = bloodType;
    const response = await api.get('/donors/nearby', { params });
    return response;
  },

  recordDonation: async (data) => {
    const response = await api.post('/donors/donate', data);
    return response;
  },

  getDonationHistory: async () => {
    const response = await api.get('/donors/history');
    return response;
  },
};

export default donorService;