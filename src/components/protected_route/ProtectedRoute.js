import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../features/authentication';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    // If not authenticated, redirect to login page
    return <Navigate to="/" />; // change to the url of the redirected page (either login or home)
  }

  return children; // If authenticated, render the children (protected component)
};

export default ProtectedRoute;
