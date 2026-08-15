import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, CheckCircle, Activity, TrendingUp, PieChart as PieChartIcon, ArrowRight, PlusCircle, UserCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardService } from '@/services/dashboardService';
import { AdminDashboardStats } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getAdminDashboard();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load admin analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-900">
        <LoadingSpinner message="Loading administration dashboard & metrics..." />
      </div>
    );
  }

  const passFailData = [
    { name: 'Passed', value: stats?.passRate || 0 },
    { name: 'Failed', value: Math.max(0, 100 - (stats?.passRate || 0)) }
  ];
  const COLORS = ['#22c55e', '#ef4444'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Platform Overview</h1>
          <p className="text-gray-400 mt-1">Live metrics across users, assessments, questions, and attempt performance.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/admin/quizzes/create')} className="btn-primary text-sm flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Create Assessment
          </button>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users className="w-8 h-8 text-blue-400"/>} title="Total Students" value={stats?.totalStudents || 0} subtitle={`Out of ${stats?.totalUsers || 0} total accounts`} />
        <StatCard icon={<BookOpen className="w-8 h-8 text-purple-400"/>} title="Published Quizzes" value={stats?.publishedQuizzes || 0} subtitle={`${stats?.totalQuizzes || 0} total created`} />
        <StatCard icon={<Activity className="w-8 h-8 text-indigo-400"/>} title="Total Attempts" value={stats?.totalAttempts || 0} subtitle={`Avg Score: ${stats?.averageScore || 0}%`} />
        <StatCard icon={<CheckCircle className="w-8 h-8 text-green-400"/>} title="Platform Pass Rate" value={`${stats?.passRate || 0}%`} subtitle="Overall success ratio" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Pass/Fail Distribution */}
        <div className="glass-card p-6 flex flex-col items-center justify-between">
          <h2 className="text-xl font-semibold mb-2 text-white flex items-center self-start gap-2">
            <PieChartIcon className="w-5 h-5 text-primary-400" />
            Assessment Pass vs Fail Ratio
          </h2>
          <div className="h-64 w-full flex flex-col items-center justify-center relative my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={passFailData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {passFailData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{stats?.passRate || 0}%</span>
              <span className="text-xs text-gray-400">Pass Rate</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-2 text-sm">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-gray-300">Pass ({stats?.passRate}%)</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-gray-300">Fail ({Math.max(0, 100 - (stats?.passRate || 0))}%)</span></div>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between">
          <h2 className="text-xl font-semibold mb-4 text-white">Management Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ManagementShortcut 
              title="Quiz Management" 
              desc="Create, edit, duplicate, and publish quizzes" 
              onClick={() => navigate('/admin/quizzes')}
            />
            <ManagementShortcut 
              title="User Directory" 
              desc="Manage student accounts, lock/unlock & roles" 
              onClick={() => navigate('/admin/users')}
            />
            <ManagementShortcut 
              title="Category Catalog" 
              desc="Organize quizzes into learning topics" 
              onClick={() => navigate('/admin/categories')}
            />
            <ManagementShortcut 
              title="Attempt History" 
              desc="Review all completed student assessment submissions" 
              onClick={() => navigate('/admin/attempts')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle }: { icon: React.ReactNode; title: string; value: string | number; subtitle?: string }) => (
  <div className="glass-card p-6 flex items-start justify-between">
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
    </div>
    <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
      {icon}
    </div>
  </div>
);

const ManagementShortcut = ({ title, desc, onClick }: { title: string; desc: string; onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex flex-col justify-between group"
  >
    <div>
      <h3 className="text-base font-semibold text-white group-hover:text-primary-300 transition-colors">{title}</h3>
      <p className="text-xs text-gray-400 mt-1">{desc}</p>
    </div>
    <div className="flex items-center gap-1 text-xs text-primary-400 mt-4 font-medium">
      Open Management <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
    </div>
  </div>
);

export default AdminDashboard;
