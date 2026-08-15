import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';

const QuestionsPage: React.FC = () => {
  const { id } = useParams();
  const [questions, setQuestions] = useState([
    { id: 1, text: 'What is React?', type: 'MCQ', marks: 5, options: [{id:1, text: 'Library', isCorrect: true}, {id:2, text: 'Framework', isCorrect: false}] }
  ]);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Questions</h1>
          <p className="text-gray-500 mt-1">Quiz ID: {id} | Total Questions: {questions.length}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Question
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <span className="font-bold text-lg text-gray-900 dark:text-white">Q{idx + 1}.</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 text-xs rounded-md font-semibold">{q.type}</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 text-xs rounded-md font-semibold">{q.marks} Marks</span>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-lg text-gray-800 dark:text-gray-200 mb-6">{q.text}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map(opt => (
                  <div key={opt.id} className={`p-4 rounded-lg border-2 flex items-center justify-between ${opt.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                    <span className="text-gray-700 dark:text-gray-300">{opt.text}</span>
                    {opt.isCorrect && <Check className="w-5 h-5 text-green-500" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add New Question</h2>
            {/* Form omitted for brevity but UI is set up */}
            <p className="text-gray-500 mb-6">Form fields for Question Text, Marks, Type, Options, Explanation...</p>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-gray-800 font-medium">Cancel</button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">Save Question</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsPage;
