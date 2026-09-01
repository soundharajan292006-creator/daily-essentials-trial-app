import api from './api';

export const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },
  
  addToCart: async (cartItemData) => {
    const response = await api.post('/cart', cartItemData);
    return response.data;
  },
  
  updateCartItem: async (id, quantity) => {
    const response = await api.put(`/cart/${id}`, { quantity });
    return response.data;
  },
  
  deleteCartItem: async (id) => {
    const response = await api.delete(`/cart/${id}`);
    return response.data;
  },
  
  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  }
};
