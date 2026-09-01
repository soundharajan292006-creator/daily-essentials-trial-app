import api from './api';

export const adminService = {
  login: async (credentials) => {
    const response = await api.post('/admin/login', credentials);
    return response.data;
  },
  
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  
  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
  
  updateUserStatus: async (id, status) => {
    const response = await api.put(`/admin/users/${id}/status`, { status });
    return response.data;
  },
  
  getOrders: async () => {
    const response = await api.get('/admin/orders');
    return response.data;
  },
  
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/admin/orders/${id}/status`, { order_status: status });
    return response.data;
  },
  
  getTrials: async () => {
    const response = await api.get('/admin/trials');
    return response.data;
  },
  
  updateTrialStatus: async (id, status) => {
    const response = await api.put(`/admin/trials/${id}/status`, { status });
    return response.data;
  },
  
  getReviews: async () => {
    const response = await api.get('/admin/reviews');
    return response.data;
  },
  
  deleteReview: async (id) => {
    const response = await api.delete(`/admin/reviews/${id}`);
    return response.data;
  }
};
