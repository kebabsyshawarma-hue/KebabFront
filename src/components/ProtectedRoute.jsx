import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ adminOnly = false }) {
  const { currentUser, loading, isAdmin } = useAuth();


  return <Outlet />;
}
