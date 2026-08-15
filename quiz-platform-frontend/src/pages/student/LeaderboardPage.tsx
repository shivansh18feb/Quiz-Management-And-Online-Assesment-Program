import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Crown, Filter, RefreshCw, Clock, Award } from 'lucide-react';
import leaderboardService from '@/services/leaderboardService';
import quizService from '@/services/quizService';
import { LeaderboardEntry, QuizSummaryResponse, PagedResponse } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Pagination from '@/components/common/Pagination';

export const LeaderboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GLOBAL' | 'QUIZ'>('GLOBAL');
  const [quizzes, setQuizzes] = useState<QuizSummaryResponse[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<PagedResponse<LeaderboardEntry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    loadLeaderboard(page);
  }, [activeTab, selectedQuizId, page]);

  const loadQuizzes = async () => {
    try {
      const res = await quizService.getPublishedQuizzes(undefined, undefined, undefined, 0, 100);
      setQuizzes(res.content);
      if (res.content.length > 0) {
        setSelectedQuizId(res.content[0].id);
      }
    } catch (err) {
      console.error('Failed to load quizzes', err);
    }
  };

  const loadLeaderboard = async (pageNo: number) => {
    try {
      setLoading(true);
      if (activeTab === 'GLOBAL') {
        const res = await leaderboardService.getGlobalLeaderboard(pageNo, 20);
        setLeaderboard(res);
      } else if (selectedQuizId) {
        const res = await leaderboardService.getQuizLeaderboard(selectedQuizId, pageNo, 20);
        setLeaderboard(res);
      }
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  const topThree = leaderboard?.content.slice(0, 3) || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Platform Leaderboard
          </h1>
          <p className="page-subtitle">See top performers ranked by assessment scores and speed.</p>
        </div>
        <button onClick={() => loadLeaderboard(page)} className="btn-secondary text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab('GLOBAL'); setPage(0); }}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'GLOBAL' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Global Rankings
          </button>
          <button
            onClick={() => { setActiveTab('QUIZ'); setPage(0); }}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'QUIZ' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Quiz Specific
          </button>
        </div>

        {activeTab === 'QUIZ' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedQuizId || ''}
              onChange={(e) => { setSelectedQuizId(parseInt(e.target.value)); setPage(0); }}
              className="input-field py-2 text-sm w-full sm:w-64"
            >
              {quizzes.map((q) => (
                <option key={q.id} value={q.id} className="bg-dark-800">
                  {q.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Top 3 Podium Cards */}
      {!loading && topThree.length > 0 && page === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="glass-card p-6 flex flex-col items-center text-center border-t-4 border-t-slate-300 transform md:translate-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-400/20 text-slate-300 flex items-center justify-center font-bold text-xl mb-3">
                <Medal className="w-7 h-7 text-slate-300" />
              </div>
              <span className="badge bg-slate-500/20 text-slate-300 mb-1">#2 Rank</span>
              <h3 className="font-bold text-white text-lg">{topThree[1].studentName}</h3>
              <p className="text-xs text-gray-400 mt-1">{topThree[1].quizTitle}</p>
              <div className="mt-4 pt-4 border-t border-white/10 w-full flex justify-around text-sm">
                <div>
                  <p className="text-xs text-gray-400">Score</p>
                  <p className="font-bold text-white">{topThree[1].score} pts</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Percentage</p>
                  <p className="font-bold text-green-400">{topThree[1].percentage}%</p>
                </div>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div className="glass-card p-6 flex flex-col items-center text-center border-2 border-yellow-500/50 bg-yellow-500/5 shadow-2xl relative">
              <div className="absolute -top-4 bg-yellow-500 text-dark-900 font-extrabold px-3 py-0.5 rounded-full text-xs flex items-center gap-1 shadow-lg">
                <Crown className="w-3.5 h-3.5" /> CHAMPION
              </div>
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold text-2xl mb-3 mt-2">
                <Trophy className="w-9 h-9 text-yellow-400" />
              </div>
              <span className="badge bg-yellow-500/20 text-yellow-400 mb-1">#1 Rank</span>
              <h3 className="font-bold text-white text-xl">{topThree[0].studentName}</h3>
              <p className="text-xs text-gray-400 mt-1">{topThree[0].quizTitle}</p>
              <div className="mt-4 pt-4 border-t border-white/10 w-full flex justify-around text-sm">
                <div>
                  <p className="text-xs text-gray-400">Score</p>
                  <p className="font-bold text-white">{topThree[0].score} pts</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Percentage</p>
                  <p className="font-bold text-green-400">{topThree[0].percentage}%</p>
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="glass-card p-6 flex flex-col items-center text-center border-t-4 border-t-amber-600 transform md:translate-y-6">
              <div className="w-12 h-12 rounded-full bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-xl mb-3">
                <Award className="w-7 h-7 text-amber-500" />
              </div>
              <span className="badge bg-amber-500/20 text-amber-400 mb-1">#3 Rank</span>
              <h3 className="font-bold text-white text-lg">{topThree[2].studentName}</h3>
              <p className="text-xs text-gray-400 mt-1">{topThree[2].quizTitle}</p>
              <div className="mt-4 pt-4 border-t border-white/10 w-full flex justify-around text-sm">
                <div>
                  <p className="text-xs text-gray-400">Score</p>
                  <p className="font-bold text-white">{topThree[2].score} pts</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Percentage</p>
                  <p className="font-bold text-green-400">{topThree[2].percentage}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Table */}
      {loading ? (
        <LoadingSpinner message="Loading leaderboard rankings..." />
      ) : !leaderboard || leaderboard.content.length === 0 ? (
        <div className="glass-card p-8 text-center text-gray-400">
          No leaderboard entries found for this selection.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-16">Rank</th>
                  <th>Student Name</th>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Time Taken</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.content.map((entry) => (
                  <tr key={entry.rank} className={entry.rank <= 3 ? 'bg-white/5' : ''}>
                    <td className="font-bold">
                      {entry.rank === 1 && <span className="text-yellow-400 flex items-center gap-1">🥇 1</span>}
                      {entry.rank === 2 && <span className="text-slate-300 flex items-center gap-1">🥈 2</span>}
                      {entry.rank === 3 && <span className="text-amber-500 flex items-center gap-1">🥉 3</span>}
                      {entry.rank > 3 && <span className="text-gray-400">#{entry.rank}</span>}
                    </td>
                    <td className="font-semibold text-white">{entry.studentName}</td>
                    <td className="text-gray-300 text-sm">{entry.quizTitle}</td>
                    <td className="font-bold text-white">{entry.score} / {entry.totalMarks}</td>
                    <td>
                      <span className="badge badge-success">{entry.percentage}%</span>
                    </td>
                    <td className="text-gray-400 text-xs flex items-center gap-1 mt-3">
                      <Clock className="w-3.5 h-3.5" />
                      {Math.floor(entry.timeTakenSeconds / 60)}m {entry.timeTakenSeconds % 60}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={leaderboard.page}
            totalPages={leaderboard.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
