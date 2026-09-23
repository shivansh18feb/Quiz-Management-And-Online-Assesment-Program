import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Clock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/utils/api';
import {
  ApiResponse,
  PagedResponse,
  QuizSummaryResponse,
} from '@/types';

interface Quiz {
  id: number;
  title: string;
  description: string;
  category: {
    id: number;
    name: string;
  };
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  durationMins: number;
  totalMarks: number;
  questionCount: number;
}

const QuizListPage: React.FC = () => {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setLoading(true);

        const response = await api.get<
          ApiResponse<PagedResponse<QuizSummaryResponse>>
        >('/quizzes?page=0&size=100');

        const quizData = response.data.data.content || [];

        const mappedQuizzes: Quiz[] = quizData.map((quiz) => ({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description || '',
          category: {
            id: quiz.categoryId || 0,
            name: quiz.categoryName || 'Uncategorized',
          },
          difficulty: quiz.difficulty,
          durationMins: quiz.durationMinutes,
          totalMarks: quiz.totalMarks,
          questionCount: quiz.questionCount,
        }));

        setQuizzes(mappedQuizzes);
      } catch (error) {
        console.error('Failed to load quizzes:', error);
        toast.error('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  const categories = Array.from(
    new Map(
      quizzes.map((quiz) => [
        quiz.category.id,
        {
          id: quiz.category.id,
          name: quiz.category.name,
        },
      ])
    ).values()
  );

  const filteredQuizzes = quizzes.filter((quiz) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      quiz.title.toLowerCase().includes(searchText) ||
      quiz.description.toLowerCase().includes(searchText);

    const matchesCategory =
      categoryFilter === 'ALL' ||
      quiz.category.id.toString() === categoryFilter;

    const matchesDifficulty =
      difficultyFilter === 'ALL' ||
      quiz.difficulty === difficultyFilter;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Browse Quizzes
        </h1>

        <div className="flex w-full md:w-auto items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />

          <input
            type="text"
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none focus:ring-0 bg-transparent text-gray-800 dark:text-white w-full md:w-64 outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 font-medium">
          <Filter className="w-5 h-5" />
          <span>Filters:</span>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Categories</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <div className="flex space-x-2">
          {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setDifficultyFilter(difficulty)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                difficultyFilter === difficulty
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {difficulty}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-500 dark:text-gray-400">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />

            <p className="text-xl">
              No quizzes found matching your criteria.
            </p>
          </div>
        ) : (
          filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group flex flex-col"
            >
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-semibold tracking-wide">
                    {quiz.category.name}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                      quiz.difficulty === 'EASY'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                        : quiz.difficulty === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                    }`}
                  >
                    {quiz.difficulty}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {quiz.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2">
                  {quiz.description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{quiz.durationMins} Mins</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span>{quiz.questionCount} Qs</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
                <button
                  onClick={() =>
                    navigate(`/student/quiz/${quiz.id}`)
                  }
                  className="flex-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  View Details
                </button>

                <button
                  onClick={() =>
                    navigate(`/student/quiz/${quiz.id}/start`)
                  }
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 dark:shadow-none"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredQuizzes.length > 0 && (
        <div className="flex justify-center items-center space-x-4 pt-8">
          <button
            disabled
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-gray-600 dark:text-gray-400 font-medium">
            Page 1 of 1
          </span>

          <button
            disabled
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizListPage;