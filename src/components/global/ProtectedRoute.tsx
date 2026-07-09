import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, claims, loading } = useAuthContext();

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-[#3C4043] bg-[#F8F9FA]">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const adminEmails = ['infowarspakistan@gmail.com', 'infowarspakistan@gmail.cin'];
  const isAdminByEmail = user.email && adminEmails.includes(user.email.toLowerCase());

  if (requiredRole && claims?.role !== requiredRole && claims?.role !== 'admin' && !isAdminByEmail) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
