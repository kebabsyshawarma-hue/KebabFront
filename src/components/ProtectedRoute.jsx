import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ adminOnly = false }) {
  const { currentUser, loading, isAdmin } = useAuth();

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-warning">Cargando...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    // Optionally redirect to a "Not Authorized" page or Home
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
