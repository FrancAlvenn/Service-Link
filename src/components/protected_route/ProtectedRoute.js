import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../features/authentication';

const ProtectedRoute = ({ children, requiredAccess }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/" state={{ from: location }} />;
  }

  // Ensure user has the required access level (e.g., 'admin' or 'user')
  if (user.access_level !== requiredAccess) {
    // Redirect to appropriate page if access level is not authorized
    return user.access_level === 'user'
      ? <Navigate to="/portal" />
      : <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
