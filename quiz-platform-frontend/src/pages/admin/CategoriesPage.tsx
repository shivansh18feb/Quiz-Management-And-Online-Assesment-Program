import React, { useEffect, useState } from 'react';
import { FolderPlus, Plus, Edit2, Trash2, BookOpen, Layers } from 'lucide-react';
import { categoryService } from '@/services/categoryService';
import { CategoryResponse } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ConfirmModal from '@/components/common/ConfirmModal';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/api';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAllCategories();
      setCategories((res as any)?.data || res);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryResponse) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, { name, description });
        toast.success('Category updated successfully');
      } else {
        await categoryService.createCategory({ name, description });
        toast.success('Category created successfully');
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      await categoryService.deleteCategory(selectedCategory.id);
      toast.success('Category deleted successfully');
      setDeleteModalOpen(false);
      loadCategories();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary-400" />
            Quiz Category Management
          </h1>
          <p className="page-subtitle">Organize assessment quizzes into domain topics and subjects.</p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Create Category
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading categories..." />
      ) : categories.length === 0 ? (
        <div className="glass-card p-8 text-center text-gray-400">
          No categories found. Click "Create Category" to add your first quiz topic!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="glass-card p-6 flex flex-col justify-between hover:bg-white/10 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 rounded-xl bg-primary-500/20 text-primary-300">
                    <BookOpen className="w-5 h-5" />
                  </span>
                  <span className="badge badge-info">
                    {cat.quizCount || 0} Quizzes
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{cat.name}</h3>
                <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                  {cat.description || 'No description provided for this category.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => handleOpenEditModal(cat)}
                  className="p-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 text-xs font-medium transition-all"
                  title="Edit Category"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setSelectedCategory(cat); setDeleteModalOpen(true); }}
                  className="p-2 rounded-lg bg-red-600/10 text-red-400 border border-red-500/20 hover:bg-red-600/20 text-xs font-medium transition-all"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Category Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Java Programming, Data Structures"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of topics covered in this category..."
                  className="input-field"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-sm"
                >
                  {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Category"
        message={`Are you sure you want to delete category "${selectedCategory?.name}"? Quizzes under this category must be reassigned first.`}
        confirmText="Delete Category"
        onConfirm={handleDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default CategoriesPage;
