import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, BookOpen, AlertTriangle, Target, CheckCircle, ChevronRight, Play } from 'lucide-react';
import { toast } from 'react-hot-toast';

const QuizDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Mock fetch
    setTimeout(() => {
      setQuiz({
        id: id,
        title: 'React Fundamentals',
        description: 'Comprehensive test on React basics, hooks, components, and state management. This test is designed to evaluate your practical knowledge of React concepts.',
        category: 'Programming',
        difficulty: 'MEDIUM',
        createdDate: '2023-10-01',
        durationMins: 30,
        totalMarks: 100,
        passingMarks: 60,
        questionCount: 20,
        hasNegativeMarking: true,
      });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (!quiz) return <div>Quiz not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold tracking-wide">
              {quiz.category}
            </span>
            <span className="px-4 py-1.5 bg-yellow-500/20 text-yellow-300 backdrop-blur-md rounded-full text-sm font-semibold tracking-wide border border-yellow-500/30">
              {quiz.difficulty}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">{quiz.title}</h1>
          <p className="text-indigo-100 text-lg max-w-3xl leading-relaxed">{quiz.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quiz Overview</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">{quiz.durationMins} Mins</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Questions</p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">{quiz.questionCount}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Target className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Marks</p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">{quiz.totalMarks}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Passing</p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">{quiz.passingMarks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-yellow-500" />
              Important Instructions
            </h2>
            <ul className="space-y-4 text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <ChevronRight className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>The quiz has a strict time limit of <strong>{quiz.durationMins} minutes</strong>. The timer will start as soon as you click 'Start Assessment'.</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Ensure you have a stable internet connection before starting.</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>The quiz will <strong>auto-submit</strong> when the timer reaches zero. All saved answers will be submitted.</span>
              </li>
              {quiz.hasNegativeMarking && (
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-red-600 dark:text-red-400 font-medium">Warning: This quiz has negative marking. Incorrect answers will result in a deduction of marks.</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ready to begin?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Make sure you have read all instructions carefully before starting the assessment.</p>
            
            <button 
              onClick={() => setShowModal(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center space-x-2 group"
            >
              <span>Start Assessment</span>
              <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 transform scale-100 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Start Quiz Confirmation</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Are you sure you want to start <strong>{quiz.title}</strong>? The timer of {quiz.durationMins} minutes will begin immediately and cannot be paused.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowModal(false);
                  navigate(`/student/attempt/${quiz.id}`);
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-md shadow-indigo-200 dark:shadow-none"
              >
                Start Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizDetailPage;
