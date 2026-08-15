import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit3, ArrowLeft, Save } from 'lucide-react';
import quizService from '@/services/quizService';
import categoryService from '@/services/categoryService';
import { CategoryResponse, Difficulty, QuizStatus, QuizResponse } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/api';

export const EditQuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(40);
  const [status, setStatus] = useState<QuizStatus>('DRAFT');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadData(parseInt(id));
    }
  }, [id]);

  const loadData = async (quizId: number) => {
    try {
      setLoading(true);
      const [quiz, cats] = await Promise.all([
        quizService.getQuizById(quizId),
        categoryService.getAllCategories(),
      ]);

      setCategories(cats);
      setTitle(quiz.title);
      setDescription(quiz.description || '');
      setCategoryId(quiz.category?.id || (cats[0]?.id || ''));
      setDifficulty(quiz.difficulty);
      setDurationMinutes(quiz.durationMinutes);
      setTotalMarks(quiz.totalMarks);
      setPassingMarks(quiz.passingMarks);
      setStatus(quiz.status);
    } catch (err) {
      toast.error('Failed to load quiz details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !categoryId || !id) {
      toast.error('Please fill in title and category');
      return;
    }
    if (passingMarks > totalMarks) {
      toast.error('Passing marks cannot be greater than total marks');
      return;
    }

    try {
      setSubmitting(true);
      await quizService.updateQuiz(parseInt(id), {
        title,
        description,
        categoryId: Number(categoryId),
        difficulty,
        durationMinutes: Number(durationMinutes),
        totalMarks: Number(totalMarks),
        passingMarks: Number(passingMarks),
        status,
      });

      toast.success('Quiz updated successfully!');
      navigate('/admin/quizzes');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading quiz details..." />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Quizzes
        </button>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Edit3 className="w-6 h-6 text-primary-400" />
          Edit Quiz: {title}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="label">Quiz Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Description & Instructions</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Category / Subject *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="input-field"
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-dark-800">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Difficulty Level *</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="input-field"
            >
              <option value="EASY" className="bg-dark-800">Easy</option>
              <option value="MEDIUM" className="bg-dark-800">Medium</option>
              <option value="HARD" className="bg-dark-800">Hard</option>
            </select>
          </div>

          <div>
            <label className="label">Duration (Minutes) *</label>
            <input
              type="number"
              min={1}
              max={300}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as QuizStatus)}
              className="input-field"
            >
              <option value="DRAFT" className="bg-dark-800">Draft (Private)</option>
              <option value="PUBLISHED" className="bg-dark-800">Published</option>
              <option value="CLOSED" className="bg-dark-800">Closed</option>
              <option value="ARCHIVED" className="bg-dark-800">Archived</option>
            </select>
          </div>

          <div>
            <label className="label">Total Marks *</label>
            <input
              type="number"
              min={1}
              value={totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Passing Marks *</label>
            <input
              type="number"
              min={0}
              value={passingMarks}
              onChange={(e) => setPassingMarks(Number(e.target.value))}
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary text-sm">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary text-sm flex items-center gap-2">
            <Save className="w-4 h-4" />
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditQuizPage;
