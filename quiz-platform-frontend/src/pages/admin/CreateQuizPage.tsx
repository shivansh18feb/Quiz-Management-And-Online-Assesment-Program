import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, ArrowLeft, Save, Sparkles } from 'lucide-react';
import quizService from '@/services/quizService';
import categoryService from '@/services/categoryService';
import { CategoryResponse, Difficulty, QuizStatus } from '@/types';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/api';
import { ROUTES } from '@/constants/routes';

export const CreateQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

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
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCats(true);
      const cats = await categoryService.getAllCategories();
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoadingCats(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !categoryId) {
      toast.error('Please fill in title and category');
      return;
    }
    if (passingMarks > totalMarks) {
      toast.error('Passing marks cannot be greater than total marks');
      return;
    }

    try {
      setSubmitting(true);
      const created = await quizService.createQuiz({
        title,
        description,
        categoryId: Number(categoryId),
        difficulty,
        durationMinutes: Number(durationMinutes),
        totalMarks: Number(totalMarks),
        passingMarks: Number(passingMarks),
        status,
      });

      toast.success('Quiz created successfully! You can now add questions.');
      navigate(`/admin/quizzes/${created.id}/questions`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Quizzes
        </button>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FilePlus className="w-6 h-6 text-primary-400" />
          Create New Assessment Quiz
        </h1>
        <p className="page-subtitle">Configure quiz details, duration, passing criteria, and publication status.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="label">Quiz Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Java Fundamentals & Spring Framework Core Quiz"
              className="input-field"
              required
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="label">Description & Instructions</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed instructions for candidates taking this assessment..."
              className="input-field"
            />
          </div>

          {/* Category */}
          <div>
            <label className="label">Category / Subject *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="input-field"
              required
            >
              {loadingCats ? (
                <option>Loading categories...</option>
              ) : (
                categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-dark-800">
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Difficulty */}
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

          {/* Duration */}
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

          {/* Initial Status */}
          <div>
            <label className="label">Initial Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as QuizStatus)}
              className="input-field"
            >
              <option value="DRAFT" className="bg-dark-800">Draft (Private)</option>
              <option value="PUBLISHED" className="bg-dark-800">Published (Visible to Students)</option>
            </select>
          </div>

          {/* Total Marks */}
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

          {/* Passing Marks */}
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
            <Sparkles className="w-4 h-4" />
            {submitting ? 'Creating...' : 'Create & Proceed to Questions'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuizPage;
