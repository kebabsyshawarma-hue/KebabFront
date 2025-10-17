import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ adminOnly = false }) {
  const { currentUser, loading, isAdmin } = useAuth();

  console.log('ProtectedRoute - currentUser:', currentUser);
  console.log('ProtectedRoute - loading:', loading);
  console.log('ProtectedRoute - isAdmin:', isAdmin);

  if (loading) {
    return <div>Loading authentication...</div>; // Or a spinner
  }

  if (!currentUser) {
    console.log('ProtectedRoute: Not logged in, redirecting to /admin/login');
    return <Navigate to="/admin/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    console.log('ProtectedRoute: Not admin, redirecting to /');
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute: Access granted');
  return <Outlet />;
}
