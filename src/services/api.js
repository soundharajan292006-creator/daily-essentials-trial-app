import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach token
api.interceptors.request.use(
  (config) => {
    // If it's an admin route, try to use admin token, else use user token
    const isAdminRoute = config.url.startsWith('/admin');
    const token = isAdminRoute ? localStorage.getItem('adminToken') : localStorage.getItem('userToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Determine if it was an admin route
      const isAdminRoute = error.config.url.startsWith('/admin');
      if (isAdminRoute) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      } else {
        localStorage.removeItem('userToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
