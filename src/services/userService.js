import api from './api';

export const userService = {
  getAddresses: async () => {
    const response = await api.get('/users/addresses');
    return response.data;
  },
  
  addAddress: async (addressData) => {
    const response = await api.post('/users/addresses', addressData);
    return response.data;
  },
  
  updateAddress: async (id, addressData) => {
    const response = await api.put(`/users/addresses/${id}`, addressData);
    return response.data;
  },
  
  deleteAddress: async (id) => {
    const response = await api.delete(`/users/addresses/${id}`);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },
  
  changePassword: async (passwordData) => {
    const response = await api.put('/users/change-password', passwordData);
    return response.data;
  },
  
  getDashboard: async () => {
    const response = await api.get('/users/dashboard');
    return response.data;
  }
};
