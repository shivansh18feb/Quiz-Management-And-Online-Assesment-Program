import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Award, ChevronRight, FileText, BarChart2, AlertCircle, ArrowLeft } from 'lucide-react';
import { attemptService } from '@/services/attemptService';
import { QuizResultResponse } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const QuizResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<QuizResultResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await attemptService.getResult(Number(id));
        if (res.success && res.data) {
          setResult(res.data);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load assessment result');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-900">
        <LoadingSpinner message="Calculating assessment score & analytics..." />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-dark-900 text-white">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-lg">Assessment result could not be found.</p>
        <button onClick={() => navigate('/student/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isPass = result.isPassed;
  const minutes = Math.floor(result.timeTakenSeconds / 60);
  const seconds = result.timeTakenSeconds % 60;
  const timeTakenFormatted = `${minutes}m ${seconds}s`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-16">
      {/* Hero Result Banner */}
      <div className={`rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden flex flex-col items-center justify-center text-center ${
        isPass ? 'bg-gradient-to-br from-green-600 to-emerald-800' : 'bg-gradient-to-br from-red-600 to-rose-900'
      }`}>
        <div className="relative z-10">
          {isPass ? (
            <Award className="w-20 h-20 mx-auto mb-4 text-yellow-300 drop-shadow-lg animate-bounce" />
          ) : (
            <XCircle className="w-20 h-20 mx-auto mb-4 text-red-200 drop-shadow-lg" />
          )}
          
          <h1 className="text-3xl md:text-5xl font-extrabold mb-2">
            {isPass ? 'Assessment Passed!' : 'Needs Improvement'}
          </h1>
          <p className="text-lg opacity-90 mb-6">
            You have {isPass ? 'successfully passed' : 'not met the passing score for'} <strong>{result.quizTitle}</strong>.
          </p>
          
          <div className="inline-block bg-white/20 backdrop-blur-md rounded-2xl px-8 py-3 text-2xl md:text-3xl font-black border border-white/30 shadow-inner">
            Score: {result.obtainedMarks} / {result.totalMarks} ({result.percentage}%)
          </div>
        </div>
      </div>

      {/* Metrics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<CheckCircle className="text-green-400 w-7 h-7"/>} label="Correct Answers" value={result.correctAnswers} />
        <MetricCard icon={<XCircle className="text-red-400 w-7 h-7"/>} label="Incorrect Answers" value={result.incorrectAnswers} />
        <MetricCard icon={<FileText className="text-gray-400 w-7 h-7"/>} label="Unanswered" value={result.unansweredQuestions} />
        <MetricCard icon={<Clock className="text-primary-400 w-7 h-7"/>} label="Time Taken" value={timeTakenFormatted} />
      </div>

      {/* Performance Summary Card */}
      <div className="glass-card p-6 md:p-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-primary-400" />
          Performance Details
        </h2>
        <div className="space-y-4">
          <DetailRow label="Candidate Name" value={result.studentName} />
          <DetailRow label="Assessment" value={result.quizTitle} />
          <DetailRow label="Submission Status" value={result.status} />
          <DetailRow label="Submission Time" value={result.endTime ? new Date(result.endTime).toLocaleString() : 'N/A'} />
          <DetailRow label="Total Questions" value={result.totalQuestions} />
          <DetailRow label="Total Marks Attempted" value={`${result.obtainedMarks} / ${result.totalMarks}`} />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <button 
          onClick={() => navigate(`/student/review/${result.attemptId}`)}
          className="btn-primary flex items-center justify-center gap-2 py-3 px-8"
        >
          <span>Review Detailed Answers</span>
          <ChevronRight className="w-4 h-4" />
        </button>
        <button 
          onClick={() => navigate('/student/dashboard')}
          className="btn-secondary flex items-center justify-center gap-2 py-3 px-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div className="glass-card p-5 flex flex-col items-center justify-center text-center">
    <div className="mb-2">{icon}</div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</div>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 text-sm">
    <span className="text-gray-400 font-medium">{label}</span>
    <span className="text-gray-200 font-semibold">{value}</span>
  </div>
);

export default QuizResultPage;
