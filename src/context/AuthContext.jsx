import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const userToken = localStorage.getItem('userToken');
      const adminToken = localStorage.getItem('adminToken');

      try {
        if (userToken) {
          const res = await authService.getMe();
          setUser(res.data);
        }
      } catch (error) {
        console.error("User token invalid", error);
        localStorage.removeItem('userToken');
      }

      try {
        if (adminToken) {
           // Admin token check could be a dashboard hit or separate me endpoint.
           // Since admin auth doesn't have a specific /me, we'll assume it's valid if we can fetch dashboard
           // or we can just rely on the token existing and let subsequent requests fail and clear it.
           // I'll add a simple admin check by calling a basic admin route like users.
           // Actually, let's just decode the token or trust it until 401. 
           // For now, I'll set a mock admin object based on the token presence, and interceptor handles 401.
           setAdmin({ role: 'admin' });
        }
      } catch (error) {
         localStorage.removeItem('adminToken');
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const loginUser = async (email, password) => {
    const res = await authService.login({ email, password });
    localStorage.setItem('userToken', res.data.token);
    setUser(res.data);
    return res;
  };

  const registerUser = async (userData) => {
    const res = await authService.register(userData);
    localStorage.setItem('userToken', res.data.token);
    setUser(res.data);
    return res;
  };

  const logoutUser = () => {
    localStorage.removeItem('userToken');
    setUser(null);
  };

  const loginAdmin = async (email, password) => {
    const res = await adminService.login({ email, password });
    localStorage.setItem('adminToken', res.data.token);
    setAdmin(res.data);
    return res;
  };

  const logoutAdmin = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      admin,
      loading,
      loginUser,
      registerUser,
      logoutUser,
      loginAdmin,
      logoutAdmin,
      isUserAuthenticated: !!user,
      isAdminAuthenticated: !!admin
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
