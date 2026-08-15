import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle, Award, Target, BookOpen, User, Activity, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { dashboardService } from '@/services/dashboardService';
import { StudentDashboardStats } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getStudentDashboard();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-900">
        <LoadingSpinner message="Loading your assessment analytics..." />
      </div>
    );
  }

  const chartData = stats?.recentAttempts?.map((att, idx) => ({
    name: att.quizTitle.length > 12 ? att.quizTitle.substring(0, 12) + '...' : att.quizTitle,
    score: att.percentage,
  })) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
        <p className="text-gray-400 mt-1">Track your online assessments, scores, and learning progress.</p>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Target className="w-8 h-8 text-blue-400"/>} title="Total Assessments" value={stats?.totalAttempts || 0} />
        <StatCard icon={<CheckCircle className="w-8 h-8 text-green-400"/>} title="Passed Assessments" value={stats?.passedQuizzes || 0} />
        <StatCard icon={<Activity className="w-8 h-8 text-purple-400"/>} title="Average Score" value={`${stats?.averagePercentage || 0}%`} />
        <StatCard icon={<Award className="w-8 h-8 text-yellow-400"/>} title="Highest Score" value={`${stats?.highestScore || 0}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-xl font-semibold mb-6 text-white flex items-center justify-between">
            <span>Recent Performance (%)</span>
            <span className="text-xs text-gray-400 font-normal">Last attempts</span>
          </h2>
          {chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              No recent attempts to display. Start a quiz to see your progress chart!
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Quick Action Navigation */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <h2 className="text-xl font-semibold mb-4 text-white">Quick Actions</h2>
          <div className="space-y-4">
            <QuickActionButton 
              icon={<BookOpen className="w-5 h-5 text-blue-400" />} 
              label="Browse Quizzes" 
              onClick={() => navigate('/student/quizzes')} 
            />
            <QuickActionButton 
              icon={<Award className="w-5 h-5 text-yellow-400" />} 
              label="Leaderboard Rankings" 
              onClick={() => navigate('/student/leaderboard')} 
            />
            <QuickActionButton 
              icon={<Activity className="w-5 h-5 text-purple-400" />} 
              label="My Attempt History" 
              onClick={() => navigate('/student/attempts')} 
            />
            <QuickActionButton 
              icon={<User className="w-5 h-5 text-primary-400" />} 
              label="My Profile" 
              onClick={() => navigate('/student/profile')} 
            />
          </div>
        </div>
      </div>

      {/* Recent Attempts Table */}
      <div className="glass-card overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Recent Attempts</h2>
          <button onClick={() => navigate('/student/attempts')} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        
        {!stats?.recentAttempts || stats.recentAttempts.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            You haven't attempted any assessments yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Result</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAttempts.map((attempt) => (
                  <tr key={attempt.attemptId}>
                    <td className="font-semibold text-white">{attempt.quizTitle}</td>
                    <td className="text-gray-400 text-xs">
                      {attempt.endTime ? new Date(attempt.endTime).toLocaleDateString() : 'In Progress'}
                    </td>
                    <td className="font-medium text-white">{attempt.obtainedMarks} / {attempt.totalMarks} ({attempt.percentage}%)</td>
                    <td>
                      <span className={`badge ${attempt.isPassed ? 'badge-success' : 'badge-danger'}`}>
                        {attempt.isPassed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td className="text-right">
                      <button 
                        onClick={() => navigate(`/student/result/${attempt.attemptId}`)}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        View Result
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string | number }) => (
  <div className="glass-card p-6 flex items-center gap-4">
    <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-white mt-0.5">{value}</h3>
    </div>
  </div>
);

const QuickActionButton = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-medium text-sm text-gray-200"
  >
    <div className="flex items-center gap-3">
      {icon}
      <span>{label}</span>
    </div>
    <ArrowRight className="w-4 h-4 text-gray-400" />
  </button>
);

export default StudentDashboard;
