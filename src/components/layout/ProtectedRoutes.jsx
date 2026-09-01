import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const UserProtectedRoute = ({ children }) => {
  const { isUserAuthenticated } = useAuth();
  
  if (!isUserAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children ? children : <Outlet />;
};

export const AdminProtectedRoute = ({ children }) => {
  const { isAdminAuthenticated } = useAuth();
  
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children ? children : <Outlet />;
};
