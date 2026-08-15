import React from 'react';
import { Outlet } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary-600/20 rounded-2xl flex items-center justify-center border border-primary-500/30 mb-4 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <BookOpen className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">QuizPlatform</h1>
          <p className="text-gray-400 mt-2 text-center">Test your knowledge with our comprehensive assessment system</p>
        </div>
        
        <Outlet />
      </div>
    </div>
  );
};
