import api from './api';

const adminService = {
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response;
  },

  updateUserStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/users/${id}/status`, {
      is_active: isActive,
    });
    return response;
  },
};

export default adminService;
