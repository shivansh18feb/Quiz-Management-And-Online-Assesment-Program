import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, HelpCircle, ArrowLeft, BookOpen, AlertCircle } from 'lucide-react';
import { attemptService } from '@/services/attemptService';
import { AttemptReviewResponse } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import { ROUTES } from '@/constants/routes';

export const QuizReviewPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [reviewData, setReviewData] = useState<AttemptReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'CORRECT' | 'INCORRECT' | 'UNANSWERED'>('ALL');

  useEffect(() => {
    if (attemptId) {
      loadReview(parseInt(attemptId));
    }
  }, [attemptId]);

  const loadReview = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await attemptService.getReview(id);
      if (res.success && res.data) {
        setReviewData(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load attempt review.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading quiz review..." />;
  if (error || !reviewData) return <ErrorState title="Error Loading Review" message={error || 'Review data not found.'} onRetry={() => loadReview(parseInt(attemptId!))} />;

  const { quizTitle, result, questions } = reviewData;

  const filteredQuestions = questions.filter((q) => {
    if (filter === 'CORRECT') return q.isCorrect;
    if (filter === 'INCORRECT') return !q.isCorrect && q.selectedOptionId !== null;
    if (filter === 'UNANSWERED') return q.selectedOptionId === null;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link to={ROUTES.STUDENT.MY_ATTEMPTS} className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Attempts
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-400" />
            Answer Review: {quizTitle}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/student/attempt/${attemptId}/result`} className="btn-secondary text-sm">
            View Score Summary
          </Link>
        </div>
      </div>

      {/* Summary Stats Banner */}
      <div className="glass-card p-6 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Total Score</p>
          <p className="text-xl font-bold text-white mt-1">{result.obtainedMarks} / {result.totalMarks}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Percentage</p>
          <p className={`text-xl font-bold mt-1 ${result.isPassed ? 'text-green-400' : 'text-red-400'}`}>
            {result.percentage}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Correct</p>
          <p className="text-xl font-bold text-green-400 mt-1">{result.correctAnswers}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Incorrect</p>
          <p className="text-xl font-bold text-red-400 mt-1">{result.incorrectAnswers}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Unanswered</p>
          <p className="text-xl font-bold text-gray-400 mt-1">{result.unansweredQuestions}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {(['ALL', 'CORRECT', 'INCORRECT', 'UNANSWERED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {f === 'ALL' && `All Questions (${questions.length})`}
            {f === 'CORRECT' && `Correct (${result.correctAnswers})`}
            {f === 'INCORRECT' && `Incorrect (${result.incorrectAnswers})`}
            {f === 'UNANSWERED' && `Unanswered (${result.unansweredQuestions})`}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {filteredQuestions.length === 0 ? (
          <div className="glass-card p-8 text-center text-gray-400">
            No questions match the selected filter.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isUnanswered = q.selectedOptionId === null;
            const isCorrect = q.isCorrect;

            return (
              <div key={q.questionId} className={`glass-card p-6 border-l-4 ${
                isUnanswered ? 'border-l-gray-500' : isCorrect ? 'border-l-green-500' : 'border-l-red-500'
              }`}>
                {/* Question Header */}
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-white">
                      Q{idx + 1}
                    </span>
                    <span className="badge badge-info">{q.questionType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isUnanswered ? (
                      <span className="badge badge-warning flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" /> Not Attempted (0 marks)
                      </span>
                    ) : isCorrect ? (
                      <span className="badge badge-success flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Correct (+{q.marksObtained} marks)
                      </span>
                    ) : (
                      <span className="badge badge-danger flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Incorrect ({q.marksObtained} marks)
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="text-lg font-semibold text-white mb-4 whitespace-pre-wrap">{q.questionText}</h3>

                {/* Options List */}
                <div className="space-y-2 mb-4">
                  {q.options.map((opt) => {
                    const isUserChoice = opt.id === q.selectedOptionId;
                    const isCorrectOpt = opt.isCorrect;

                    let optionStyle = 'border-white/10 bg-white/5 text-gray-300';
                    if (isCorrectOpt) {
                      optionStyle = 'border-green-500/50 bg-green-500/10 text-green-300 font-medium';
                    } else if (isUserChoice && !isCorrectOpt) {
                      optionStyle = 'border-red-500/50 bg-red-500/10 text-red-300';
                    }

                    return (
                      <div key={opt.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${optionStyle}`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${
                            isCorrectOpt ? 'border-green-400 bg-green-500/20 text-green-300' :
                            isUserChoice ? 'border-red-400 bg-red-500/20 text-red-300' : 'border-gray-500 text-gray-400'
                          }`}>
                            {isCorrectOpt ? '✓' : isUserChoice ? '✗' : ''}
                          </span>
                          <span>{opt.optionText}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isUserChoice && (
                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">Your Answer</span>
                          )}
                          {isCorrectOpt && (
                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded">Correct Answer</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {q.explanation && (
                  <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-300 mb-1">Explanation</h4>
                      <p className="text-sm text-gray-300 leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QuizReviewPage;
