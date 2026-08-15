import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Settings, Copy, Power } from 'lucide-react';

const QuizzesPage: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  
  useEffect(() => {
    setQuizzes([
      { id: 1, title: 'React Fundamentals', category: 'Programming', difficulty: 'MEDIUM', status: 'PUBLISHED', questions: 20, duration: 30 },
      { id: 2, title: 'CSS Layouts', category: 'Design', difficulty: 'EASY', status: 'DRAFT', questions: 15, duration: 20 },
      { id: 3, title: 'Advanced Docker', category: 'DevOps', difficulty: 'HARD', status: 'PUBLISHED', questions: 30, duration: 45 },
    ]);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Quizzes</h1>
        <button 
          onClick={() => navigate('/admin/quizzes/create')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Quiz
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex gap-4">
          <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input type="text" placeholder="Search quizzes..." className="bg-transparent border-none outline-none w-full text-gray-800 dark:text-white" />
          </div>
          <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter className="w-5 h-5 mr-2" /> Filter
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Quiz Title</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Stats</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800 dark:text-white">{quiz.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{quiz.difficulty}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{quiz.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    <div>{quiz.questions} Qs</div>
                    <div>{quiz.duration} Mins</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${quiz.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-gray-100 text-gray-700 dark:bg-gray-700'}`}>
                      {quiz.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => navigate(`/admin/quizzes/${quiz.id}/questions`)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Manage Questions">
                        <Settings className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit Quiz">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete Quiz">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuizzesPage;
