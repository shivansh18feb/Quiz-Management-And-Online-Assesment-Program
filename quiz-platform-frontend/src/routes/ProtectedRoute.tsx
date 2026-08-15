import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';

interface ProtectedRouteProps {
  allowedRole?: 'ROLE_ADMIN' | 'ROLE_STUDENT';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    const redirectTo = user?.role === 'ROLE_ADMIN' ? ROUTES.ADMIN.DASHBOARD : ROUTES.STUDENT.DASHBOARD;
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};
