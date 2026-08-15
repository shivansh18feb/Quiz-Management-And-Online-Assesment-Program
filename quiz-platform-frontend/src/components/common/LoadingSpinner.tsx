import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col justify-center items-center p-8 gap-3">
      <div className={`${sizeClasses[size]} border-primary-500 border-t-transparent rounded-full animate-spin`} />
      {message && <p className="text-sm text-gray-400 font-medium animate-pulse">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
