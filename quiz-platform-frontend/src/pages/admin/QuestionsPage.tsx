import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import questionService from '@/services/questionService';
import {
  QuestionResponse,
  QuestionType,
  CreateQuestionRequest,
} from '@/types';

interface OptionForm {
  optionText: string;
  isCorrect: boolean;
}

const QuestionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const quizId = Number(id);

  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null
  );

  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] =
    useState<QuestionType>('MULTIPLE_CHOICE');
  const [marks, setMarks] = useState(5);
  const [negativeMarks, setNegativeMarks] = useState(0);
  const [explanation, setExplanation] = useState('');

  const [options, setOptions] = useState<OptionForm[]>([
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
  ]);

  // -----------------------------
  // Load Questions
  // -----------------------------
  const loadQuestions = async () => {
    if (!quizId) return;

    try {
      setLoading(true);

      const response = await questionService.getQuestions(quizId);

      setQuestions(response.data);
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [quizId]);

  // -----------------------------
  // Reset Form
  // -----------------------------
  const resetForm = () => {
    setQuestionText('');
    setQuestionType('MULTIPLE_CHOICE');
    setMarks(5);
    setNegativeMarks(0);
    setExplanation('');

    setOptions([
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
    ]);

    setEditingQuestionId(null);
  };

  // -----------------------------
  // Open Add Modal
  // -----------------------------
  const handleAddQuestion = () => {
    resetForm();
    setShowModal(true);
  };

  // -----------------------------
  // Open Edit Modal
  // -----------------------------
  const handleEditQuestion = (question: QuestionResponse) => {
    setEditingQuestionId(question.id);

    setQuestionText(question.questionText);
    setQuestionType(question.questionType);
    setMarks(question.marks);
    setNegativeMarks(question.negativeMarks);
    setExplanation(question.explanation || '');

    setOptions(
      question.options.map((option) => ({
        optionText: option.optionText,
        isCorrect: option.isCorrect ?? false,
      }))
    );

    setShowModal(true);
  };

  // -----------------------------
  // Add Option
  // -----------------------------
  const handleAddOption = () => {
    if (options.length >= 6) {
      toast.error('Maximum 6 options allowed');
      return;
    }

    setOptions([
      ...options,
      {
        optionText: '',
        isCorrect: false,
      },
    ]);
  };

  // -----------------------------
  // Remove Option
  // -----------------------------
  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      toast.error('At least 2 options are required');
      return;
    }

    setOptions(options.filter((_, i) => i !== index));
  };

  // -----------------------------
  // Update Option Text
  // -----------------------------
  const handleOptionTextChange = (
    index: number,
    value: string
  ) => {
    const updatedOptions = [...options];

    updatedOptions[index].optionText = value;

    setOptions(updatedOptions);
  };

  // -----------------------------
  // Toggle Correct Answer
  // -----------------------------
  const handleCorrectChange = (index: number) => {
    const updatedOptions = [...options];

    if (questionType === 'SINGLE_CORRECT') {
      updatedOptions.forEach((option, i) => {
        option.isCorrect = i === index;
      });
    } else {
      updatedOptions[index].isCorrect =
        !updatedOptions[index].isCorrect;
    }

    setOptions(updatedOptions);
  };

  // -----------------------------
  // Save Question
  // -----------------------------
  const handleSaveQuestion = async () => {
    if (!questionText.trim()) {
      toast.error('Question text is required');
      return;
    }

    if (options.length < 2) {
      toast.error('At least 2 options are required');
      return;
    }

    if (options.some((option) => !option.optionText.trim())) {
      toast.error('All options must have text');
      return;
    }

    const hasCorrectAnswer = options.some(
      (option) => option.isCorrect
    );

    if (!hasCorrectAnswer) {
      toast.error('Select at least one correct answer');
      return;
    }

    const request: CreateQuestionRequest = {
      questionText: questionText.trim(),
      questionType,
      marks,
      negativeMarks,
      explanation: explanation.trim() || undefined,
      orderIndex:
        editingQuestionId !== null
          ? questions.findIndex(
              (q) => q.id === editingQuestionId
            )
          : questions.length,
      options: options.map((option) => ({
        optionText: option.optionText.trim(),
        isCorrect: option.isCorrect,
      })),
    };

    try {
      if (editingQuestionId !== null) {
        await questionService.updateQuestion(
          editingQuestionId,
          request
        );

        toast.success('Question updated successfully');
      } else {
        await questionService.addQuestion(quizId, request);

        toast.success('Question added successfully');
      }

      setShowModal(false);
      resetForm();

      await loadQuestions();
    } catch (error) {
      console.error('Failed to save question:', error);
      toast.error('Failed to save question');
    }
  };

  // -----------------------------
  // Delete Question
  // -----------------------------
  const handleDeleteQuestion = async (questionId: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this question?'
    );

    if (!confirmed) return;

    try {
      await questionService.deleteQuestion(questionId);

      toast.success('Question deleted successfully');

      await loadQuestions();
    } catch (error) {
      console.error('Failed to delete question:', error);
      toast.error('Failed to delete question');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Manage Questions
          </h1>

          <p className="text-gray-500 mt-1">
            Quiz ID: {quizId} | Total Questions: {questions.length}
          </p>
        </div>

        <button
          onClick={handleAddQuestion}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Question
        </button>
      </div>

      {/* Questions */}
      <div className="space-y-4">

        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-500">
            Loading questions...
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-500 mb-4">
              No questions have been added yet.
            </p>

            <button
              onClick={handleAddQuestion}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium"
            >
              Add First Question
            </button>
          </div>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >

              {/* Question Header */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">

                <div className="flex items-center space-x-4">

                  <span className="font-bold text-lg text-gray-900 dark:text-white">
                    Q{idx + 1}.
                  </span>

                  <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 text-xs rounded-md font-semibold">
                    {q.questionType}
                  </span>

                  <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 text-xs rounded-md font-semibold">
                    {q.marks} Marks
                  </span>

                </div>

                <div className="flex space-x-2">

                  <button
                    onClick={() => handleEditQuestion(q)}
                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    title="Edit Question"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              </div>

              {/* Question Body */}
              <div className="p-6">

                <p className="text-lg text-gray-800 dark:text-gray-200 mb-6">
                  {q.questionText}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {q.options.map((option) => (
                    <div
                      key={option.id}
                      className={`p-4 rounded-lg border-2 flex items-center justify-between ${
                        option.isCorrect
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {option.optionText}
                      </span>

                      {option.isCorrect && (
                        <Check className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  ))}

                </div>

                {q.explanation && (
                  <div className="mt-5 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Explanation
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      {q.explanation}
                    </p>
                  </div>
                )}

              </div>
            </div>
          ))
        )}

      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingQuestionId !== null
                  ? 'Edit Question'
                  : 'Add New Question'}
              </h2>

              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* Question Text */}
            <div className="mb-4">

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question Text *
              </label>

              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={3}
                placeholder="Enter your question..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />

            </div>

            {/* Type / Marks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Question Type
                </label>

                <select
                  value={questionType}
                  onChange={(e) =>
                    setQuestionType(
                      e.target.value as QuestionType
                    )
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="MULTIPLE_CHOICE">
                    Multiple Choice
                  </option>

                  <option value="SINGLE_CORRECT">
                    Single Correct
                  </option>

                  <option value="TRUE_FALSE">
                    True / False
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Marks
                </label>

                <input
                  type="number"
                  min="1"
                  value={marks}
                  onChange={(e) =>
                    setMarks(Number(e.target.value))
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Negative Marks
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={negativeMarks}
                  onChange={(e) =>
                    setNegativeMarks(Number(e.target.value))
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

            </div>

            {/* Options */}
            <div className="mb-4">

              <div className="flex justify-between items-center mb-2">

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Options *
                </label>

                {options.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    + Add Option
                  </button>
                )}

              </div>

              <div className="space-y-3">

                {options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2"
                  >

                    <input
                      type="text"
                      value={option.optionText}
                      onChange={(e) =>
                        handleOptionTextChange(
                          index,
                          e.target.value
                        )
                      }
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleCorrectChange(index)
                      }
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        option.isCorrect
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {option.isCorrect
                        ? 'Correct'
                        : 'Mark Correct'}
                    </button>

                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveOption(index)
                        }
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                  </div>
                ))}

              </div>

            </div>

            {/* Explanation */}
            <div className="mb-6">

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Explanation
              </label>

              <textarea
                value={explanation}
                onChange={(e) =>
                  setExplanation(e.target.value)
                }
                rows={3}
                placeholder="Optional explanation..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />

            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">

              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-medium"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveQuestion}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
              >
                {editingQuestionId !== null
                  ? 'Update Question'
                  : 'Save Question'}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default QuestionsPage;