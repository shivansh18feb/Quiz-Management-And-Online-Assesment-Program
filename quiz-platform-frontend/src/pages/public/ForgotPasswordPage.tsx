import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="glass-card p-8 sm:p-10 w-full text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Forgot Password</h2>
      <p className="text-gray-400 mb-6">This feature is coming soon.</p>
      <Link to={ROUTES.LOGIN} className="text-primary-400 hover:text-primary-300">
        Back to Login
      </Link>
    </div>
  );
};
