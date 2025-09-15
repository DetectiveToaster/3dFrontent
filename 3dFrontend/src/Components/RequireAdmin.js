import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../utils/authz';

function RequireAdmin({ children }) {
  const { user, token, loadingUser, refreshUser } = useAuth();
  const location = useLocation();
  useEffect(() => {
    if (token) {
      // Ensure we always have a fresh profile when entering admin routes
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (loadingUser) {
    return <div style={{ padding: 16 }}><p>Checking access…</p></div>;
  }
  if (!isAdmin(user)) {
    return <div style={{ padding: 16 }}><h2>403 - Forbidden</h2><p>You do not have access to the admin area.</p></div>;
  }
  return children;
}

export default RequireAdmin;
