// src/services/donorService.js
import api from './api';

const donorService = {
  // Get all donors (admin/manager only)
  getAllDonors: async (params = {}) => {
    try {
      const response = await api.get('/donors', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get current donor profile
  getMyProfile: async () => {
    try {
      const response = await api.get('/donors/me');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get donor by ID
  getDonorById: async (id) => {
    try {
      const response = await api.get(`/donors/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Register as donor
  registerDonor: async (data) => {
    try {
      const response = await api.post('/donors/register', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update donor profile
  updateDonorProfile: async (data) => {
    try {
      const response = await api.put('/donors/me', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update donor by ID (admin only)
  updateDonorById: async (id, data) => {
    try {
      const response = await api.put(`/donors/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get eligible donors only
  getEligibleDonors: async () => {
    try {
      const response = await api.get('/donors/eligible');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get nearby donors (Haversine)
  getNearbyDonors: async ({ hospitalId, radiusKm = 10, bloodType, latitude, longitude }) => {
    try {
      const response = await api.get('/donors/nearby', {
        params: {
          hospitalId,
          radiusKm,
          bloodType,
          latitude,
          longitude,
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Record donation
  recordDonation: async (data) => {
    try {
      const response = await api.post('/donors/donate', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get donation history
  getDonationHistory: async () => {
    try {
      const response = await api.get('/donors/history');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get donor statistics
  getDonorStats: async () => {
    try {
      const response = await api.get('/donors/stats');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Check eligibility
  checkEligibility: async () => {
    try {
      const response = await api.get('/donors/eligibility');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete donor (admin only)
  deleteDonor: async (id) => {
    try {
      const response = await api.delete(`/donors/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default donorService;
