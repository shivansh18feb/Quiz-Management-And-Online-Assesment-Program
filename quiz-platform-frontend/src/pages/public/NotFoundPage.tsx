import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white mb-6">Page Not Found</h2>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to={ROUTES.LOGIN} className="btn-primary">
        Go Back Home
      </Link>
    </div>
  );
};
