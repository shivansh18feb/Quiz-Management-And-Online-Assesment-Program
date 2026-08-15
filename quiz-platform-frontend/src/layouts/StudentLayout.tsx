import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { 
  LayoutDashboard, 
  BookOpen, 
  History, 
  Trophy, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

export const StudentLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { path: ROUTES.STUDENT.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { path: ROUTES.STUDENT.QUIZZES, label: 'Browse Quizzes', icon: BookOpen },
    { path: ROUTES.STUDENT.MY_ATTEMPTS, label: 'My Attempts', icon: History },
    { path: ROUTES.STUDENT.LEADERBOARD, label: 'Leaderboard', icon: Trophy },
    { path: ROUTES.STUDENT.PROFILE, label: 'Profile', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col md:flex-row">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-[var(--sidebar-width)] bg-dark-800 border-r border-white/5 transform transition-transform duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-[var(--header-height)] flex items-center px-6 border-b border-white/5">
          <BookOpen className="w-6 h-6 text-primary-500 mr-3" />
          <span className="text-xl font-bold text-white tracking-tight">QuizPlatform</span>
          <button 
            className="md:hidden ml-auto text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              end={link.path === ROUTES.STUDENT.DASHBOARD}
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-[var(--header-height)] bg-dark-800/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0">
          <button 
            className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full pl-2 pr-4 py-1.5">
              <div className="w-8 h-8 rounded-full bg-primary-600/30 flex items-center justify-center text-primary-400 font-bold border border-primary-500/30">
                {user?.firstName?.[0] || 'U'}
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className="text-sm font-medium text-white leading-none">{user?.firstName} {user?.lastName}</span>
                <span className="text-xs text-primary-400 mt-1 leading-none">Student</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
