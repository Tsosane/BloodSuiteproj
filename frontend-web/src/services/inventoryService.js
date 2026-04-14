// src/services/inventoryService.js
import api from './api';

const inventoryService = {
  // Get all inventory (FEFO ordered)
  getAllInventory: async (params = {}) => {
    try {
      const response = await api.get('/inventory', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get inventory by hospital
  getInventoryByHospital: async (hospitalId) => {
    try {
      const response = await api.get(`/inventory/hospital/${hospitalId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get single inventory item
  getInventoryItem: async (id) => {
    try {
      const response = await api.get(`/inventory/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Add new blood unit
  addBloodUnit: async (data) => {
    try {
      const response = await api.post('/inventory', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update blood unit
  updateBloodUnit: async (id, data) => {
    try {
      const response = await api.put(`/inventory/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete blood unit
  deleteBloodUnit: async (id) => {
    try {
      const response = await api.delete(`/inventory/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get expiring units (within 7 days)
  getExpiringUnits: async () => {
    try {
      const response = await api.get('/inventory/expiring');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get low stock units (below threshold)
  getLowStockUnits: async (threshold = 5) => {
    try {
      const response = await api.get(`/inventory/low-stock?threshold=${threshold}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get inventory by blood type
  getInventoryByBloodType: async (bloodType) => {
    try {
      const response = await api.get(`/inventory/blood-type/${bloodType}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update unit status
  updateUnitStatus: async (id, status) => {
    try {
      const response = await api.patch(`/inventory/${id}/status`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get inventory summary (for dashboard)
  getInventorySummary: async () => {
    try {
      const response = await api.get('/inventory/summary');
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default inventoryService;