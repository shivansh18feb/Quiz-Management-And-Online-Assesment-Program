import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { History, Award, CheckCircle2, XCircle, Eye, RefreshCw, Calendar, Clock } from 'lucide-react';
import { attemptService } from '@/services/attemptService';
import { QuizResultResponse, PagedResponse } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import { format } from 'date-fns';

export const MyAttemptsPage: React.FC = () => {
  const navigate = useNavigate();
  const [attemptsData, setAttemptsData] = useState<PagedResponse<QuizResultResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadAttempts(page);
  }, [page]);

  const loadAttempts = async (pageNo: number) => {
    try {
      setLoading(true);
      const res = await attemptService.getMyAttempts(pageNo, 10);
      setAttemptsData((res as any)?.data || res);
    } catch (err) {
      console.error('Failed to load attempts', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-primary-400" />
            My Assessment Attempts
          </h1>
          <p className="page-subtitle">Track your past quiz performances and review detailed answers.</p>
        </div>
        <button onClick={() => loadAttempts(page)} className="btn-secondary text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your attempts history..." />
      ) : !attemptsData || attemptsData.content.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Quiz Attempts Yet"
          description="You haven't attempted any quizzes so far. Browse available quizzes to test your knowledge!"
          action={{
            label: 'Browse Quizzes',
            onClick: () => navigate('/student/quizzes'),
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Attempt Date</th>
                  <th>Time Taken</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attemptsData.content.map((attempt) => (
                  <tr key={attempt.attemptId}>
                    <td className="font-semibold text-white">
                      {attempt.quizTitle}
                    </td>
                    <td className="text-gray-400 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {attempt.startTime ? format(new Date(attempt.startTime), 'MMM dd, yyyy HH:mm') : 'N/A'}
                      </div>
                    </td>
                    <td className="text-gray-300 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {formatTime(attempt.timeTakenSeconds || 0)}
                      </div>
                    </td>
                    <td className="font-medium text-white">
                      {attempt.obtainedMarks} / {attempt.totalMarks}
                    </td>
                    <td className="font-bold">
                      <span className={attempt.isPassed ? 'text-green-400' : 'text-red-400'}>
                        {attempt.percentage}%
                      </span>
                    </td>
                    <td>
                      {attempt.isPassed ? (
                        <span className="badge badge-success flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" /> PASSED
                        </span>
                      ) : (
                        <span className="badge badge-danger flex items-center gap-1 w-max">
                          <XCircle className="w-3 h-3" /> FAILED
                        </span>
                      )}
                    </td>
                    <td className="text-right space-x-2">
                      <Link
                        to={`/student/attempt/${attempt.attemptId}/result`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-600/20 text-primary-300 hover:bg-primary-600/30 text-xs font-medium border border-primary-500/30 transition-all"
                      >
                        <Award className="w-3.5 h-3.5" /> Score
                      </Link>
                      <Link
                        to={`/student/attempt/${attempt.attemptId}/review`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 text-xs font-medium border border-white/10 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={attemptsData.page}
            totalPages={attemptsData.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
};

export default MyAttemptsPage;
