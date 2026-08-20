import React, { useEffect, useState } from 'react';
import { History, RefreshCw, CheckCircle2, XCircle, Clock, Search, Calendar, Award } from 'lucide-react';
import { attemptService } from '@/services/attemptService';
import { QuizResultResponse, PagedResponse } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Pagination from '@/components/common/Pagination';
import { format } from 'date-fns';

export const AttemptsPage: React.FC = () => {
  const [attemptsData, setAttemptsData] = useState<PagedResponse<QuizResultResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadAttempts(page);
  }, [page]);

  const loadAttempts = async (pageNo: number) => {
    try {
      setLoading(true);
      const res = await attemptService.getAllAttemptsAdmin(pageNo, 10);
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-primary-400" />
            Platform Attempt Monitoring
          </h1>
          <p className="page-subtitle">Real-time log of all student assessment submissions across quizzes.</p>
        </div>
        <button onClick={() => loadAttempts(page)} className="btn-secondary text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading all platform attempts..." />
      ) : !attemptsData || attemptsData.content.length === 0 ? (
        <div className="glass-card p-8 text-center text-gray-400">
          No attempts recorded on the platform yet.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Quiz Title</th>
                  <th>Submitted At</th>
                  <th>Time Taken</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attemptsData.content.map((attempt) => (
                  <tr key={attempt.attemptId}>
                    <td className="font-semibold text-white">
                      {attempt.studentName || 'Student'}
                    </td>
                    <td className="text-gray-300 font-medium">
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

export default AttemptsPage;
