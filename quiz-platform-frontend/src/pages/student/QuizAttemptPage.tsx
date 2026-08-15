import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Flag, ChevronLeft, ChevronRight, XCircle, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { attemptService } from '@/services/attemptService';
import { QuestionResponse, StartAttemptResponse } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';

type QuestionStatus = 'UNANSWERED' | 'ANSWERED' | 'MARKED_FOR_REVIEW';

const QuizAttemptPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [attemptData, setAttemptData] = useState<StartAttemptResponse | null>(null);
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [reviewMarks, setReviewMarks] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const isAutoSubmitting = useRef(false);

  // Initialize and start quiz attempt
  useEffect(() => {
    if (!id) return;
    const initAttempt = async () => {
      try {
        setLoading(true);
        const res = await attemptService.startAttempt(Number(id));
        if (res.success && res.data) {
          setAttemptData(res.data);
          setQuestions(res.data.questions || []);
          
          // Calculate remaining seconds from server endTime
          if (res.data.endTime) {
            const endMs = new Date(res.data.endTime).getTime();
            const nowMs = Date.now();
            const remainingSec = Math.max(0, Math.floor((endMs - nowMs) / 1000));
            setTimeLeft(remainingSec > 0 ? remainingSec : (res.data.durationMinutes || 30) * 60);
          } else {
            setTimeLeft((res.data.durationMinutes || 30) * 60);
          }
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to start quiz attempt');
        navigate('/student/quizzes');
      } finally {
        setLoading(false);
      }
    };

    initAttempt();
  }, [id, navigate]);

  // Real-time Countdown Timer
  useEffect(() => {
    if (loading || !attemptData) return;
    if (timeLeft <= 0) {
      if (!isAutoSubmitting.current) {
        isAutoSubmitting.current = true;
        toast.error('Time is up! Submitting your assessment automatically...');
        handleFinalSubmit();
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, attemptData]);

  // Save selected answer in real-time
  const handleSelectOption = async (questionId: number, optionId: number) => {
    if (!attemptData) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));

    try {
      await attemptService.saveAnswer(attemptData.attemptId, {
        questionId,
        selectedOptionId: optionId,
      });
    } catch (err) {
      console.error('Failed to auto-save answer:', err);
    }
  };

  // Clear answer
  const handleClearAnswer = async (questionId: number) => {
    if (!attemptData) return;
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });

    try {
      await attemptService.saveAnswer(attemptData.attemptId, {
        questionId,
        selectedOptionId: null,
      });
    } catch (err) {
      console.error('Failed to clear answer:', err);
    }
  };

  // Submit Attempt
  const handleFinalSubmit = useCallback(async () => {
    if (!attemptData || submitting) return;
    try {
      setSubmitting(true);
      const res = await attemptService.submitAttempt(attemptData.attemptId);
      if (res.success && res.data) {
        toast.success('Assessment Submitted Successfully!');
        navigate(`/student/result/${res.data.attemptId}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit quiz attempt');
      setSubmitting(false);
    }
  }, [attemptData, submitting, navigate]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatus = (qId: number): QuestionStatus => {
    if (reviewMarks[qId]) return 'MARKED_FOR_REVIEW';
    if (answers[qId] !== undefined) return 'ANSWERED';
    return 'UNANSWERED';
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-900">
        <LoadingSpinner message="Preparing your assessment session..." />
      </div>
    );
  }

  if (!attemptData || questions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4 bg-dark-900 text-white">
        <AlertTriangle className="w-12 h-12 text-yellow-400" />
        <p className="text-lg">No questions available for this assessment.</p>
        <button onClick={() => navigate('/student/quizzes')} className="btn-primary">
          Back to Quizzes
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const reviewCount = Object.keys(reviewMarks).filter(k => reviewMarks[parseInt(k)]).length;
  const isDangerTime = timeLeft < 300; // < 5 mins

  return (
    <div className="flex flex-col h-screen bg-dark-900 text-gray-100">
      {/* Top Header Bar */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center z-10 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">{attemptData.quizTitle}</h1>
          <p className="text-xs text-gray-400">Attempt ID: #{attemptData.attemptId} | Questions: {questions.length}</p>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className={`flex items-center px-4 py-2 rounded-xl font-mono text-xl font-bold ${
            isDangerTime ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
          }`}>
            <Clock className="w-5 h-5 mr-2" />
            {formatTime(timeLeft)}
          </div>
          
          <button 
            onClick={() => setShowSubmitModal(true)}
            disabled={submitting}
            className="btn-primary bg-green-600 hover:bg-green-500 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Question Workspace */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-4xl mx-auto">
            {/* Question Header & Points */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Question {currentIdx + 1} <span className="text-sm font-normal text-gray-400">of {questions.length}</span>
              </h2>
              <div className="flex space-x-3">
                <span className="badge badge-success text-sm py-1 px-3">+{currentQ.marks} Marks</span>
                {currentQ.negativeMarks > 0 && (
                  <span className="badge badge-danger text-sm py-1 px-3">-{currentQ.negativeMarks} Marks</span>
                )}
              </div>
            </div>

            {/* Question Body */}
            <div className="glass-card p-8 mb-8">
              <p className="text-lg text-gray-200 mb-8 leading-relaxed whitespace-pre-wrap">
                {currentQ.questionText}
              </p>

              <div className="space-y-4">
                {currentQ.options?.map((opt, idx) => (
                  <label 
                    key={opt.id} 
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`quiz-option flex items-center ${
                      answers[currentQ.id] === opt.id ? 'selected' : ''
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all ${
                      answers[currentQ.id] === opt.id ? 'border-primary-500 bg-primary-500/20' : 'border-gray-500'
                    }`}>
                      {answers[currentQ.id] === opt.id && <div className="w-2.5 h-2.5 bg-primary-400 rounded-full"></div>}
                    </div>
                    <span className="text-gray-200 font-medium text-base">
                      {String.fromCharCode(65 + idx)}. {opt.optionText}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <button 
                  onClick={() => setReviewMarks(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))}
                  className={`btn-secondary text-sm flex items-center gap-2 ${
                    reviewMarks[currentQ.id] ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' : ''
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  {reviewMarks[currentQ.id] ? 'Unmark Review' : 'Mark for Review'}
                </button>
                
                {answers[currentQ.id] !== undefined && (
                  <button 
                    onClick={() => handleClearAnswer(currentQ.id)}
                    className="btn-secondary text-sm flex items-center gap-2 text-gray-400 hover:text-red-400"
                  >
                    <XCircle className="w-4 h-4" />
                    Clear Choice
                  </button>
                )}
              </div>
              
              <div className="flex space-x-4">
                <button 
                  onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  className="btn-secondary flex items-center gap-1"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>
                <button 
                  onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentIdx === questions.length - 1}
                  className="btn-primary flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Right Question Palette */}
        <aside className="w-80 glass-card rounded-none border-y-0 border-r-0 flex flex-col shrink-0">
          <div className="p-4 border-b border-white/10 font-semibold text-white">
            Question Palette
          </div>
          
          <div className="p-4 grid grid-cols-4 gap-3 overflow-y-auto max-h-[60vh]">
            {questions.map((q, idx) => {
              const status = getStatus(q.id);
              const isActive = idx === currentIdx;
              
              let btnClass = 'question-palette-btn unanswered';
              if (status === 'ANSWERED') btnClass = 'question-palette-btn answered';
              if (status === 'MARKED_FOR_REVIEW') btnClass = 'question-palette-btn marked';
              if (isActive) btnClass += ' current';

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={btnClass}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-auto p-4 border-t border-white/10 space-y-2.5 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-green-500"></div>
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-white/10 border border-white/20"></div>
              <span>Unanswered ({questions.length - answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-yellow-500"></div>
              <span>Marked for Review ({reviewCount})</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Confirm Submission</h2>
            
            <div className="space-y-3 mb-6 bg-white/5 p-4 rounded-xl text-sm border border-white/10">
              <div className="flex justify-between text-gray-300"><span>Total Questions:</span> <strong>{questions.length}</strong></div>
              <div className="flex justify-between text-green-400"><span>Answered:</span> <strong>{answeredCount}</strong></div>
              <div className="flex justify-between text-yellow-400"><span>Marked for Review:</span> <strong>{reviewCount}</strong></div>
              <div className="flex justify-between text-red-400"><span>Unanswered:</span> <strong>{questions.length - answeredCount}</strong></div>
            </div>

            <p className="text-gray-400 mb-6 text-sm">Are you sure you want to submit? You cannot change your answers after submission.</p>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="btn-secondary flex-1"
              >
                Continue Test
              </button>
              <button 
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="btn-primary bg-green-600 hover:bg-green-500 flex-1 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {submitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizAttemptPage;
