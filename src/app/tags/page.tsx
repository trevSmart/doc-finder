'use client';

import { useState, useEffect } from 'react';
import { useTags } from '@/contexts/TagContext';
import { Tag, TagColor, TagFormData, TAG_COLORS } from '@/types/tag';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export default function TagsPage() {
  const { tags, createTag, updateTag, deleteTag, isLoading } = useTags();
  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState<TagFormData>({
    text: '',
    color: 'blue',
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.text.trim()) return;

    if (editingTag) {
      updateTag(editingTag.id, formData);
      setEditingTag(null);
    } else {
      createTag(formData);
      setIsCreating(false);
    }

    setFormData({ text: '', color: 'blue' });
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      text: tag.text,
      color: tag.color,
    });
    setIsCreating(false);
  };

  const handleDelete = (tag: Tag) => {
    if (confirm(`Are you sure you want to delete the tag "${tag.text}"?`)) {
      deleteTag(tag.id);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTag(null);
    setFormData({ text: '', color: 'blue' });
  };

  const sortedTags = [...tags].sort((a, b) => a.text.localeCompare(b.text));

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tag Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Create, edit, and organize your document tags
              </p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <PlusIcon className="h-4 w-4" />
              New Tag
            </button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingTag) && (
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              {editingTag ? 'Edit Tag' : 'Create New Tag'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Text Input */}
              <div>
                <label htmlFor="tag-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tag Text
                </label>
                <input
                  id="tag-text"
                  type="text"
                  value={formData.text}
                  onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="Enter tag text..."
                  required
                  autoFocus
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tag Color
                </label>
                <div className="mt-2 grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-11">
                  {Object.entries(TAG_COLORS).map(([colorKey, colorInfo]) => (
                    <button
                      key={colorKey}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: colorKey as TagColor }))}
                      className={`relative h-10 w-10 rounded-lg border-2 transition-all hover:scale-105 ${
                        formData.color === colorKey
                          ? 'border-gray-900 dark:border-white'
                          : 'border-gray-300 dark:border-gray-600'
                      } ${colorInfo.bgClass}`}
                      title={colorInfo.name}
                    >
                      {formData.color === colorKey && (
                        <CheckIcon className="absolute inset-0 m-auto h-4 w-4 text-gray-900 dark:text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  <CheckIcon className="h-4 w-4" />
                  {editingTag ? 'Update Tag' : 'Create Tag'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tags List */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              All Tags ({tags.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Loading tags...
            </div>
          ) : sortedTags.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <p className="mb-2">No tags created yet</p>
              <p className="text-sm">Click "New Tag" to create your first tag</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedTags.map((tag) => {
                const colorInfo = TAG_COLORS[tag.color];
                return (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex items-center gap-4">
                      {/* Tag Preview */}
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${colorInfo.bgClass} ${colorInfo.textClass}`}
                      >
                        {tag.text}
                      </span>

                      {/* Tag Info */}
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <div>Color: {colorInfo.name}</div>
                        <div>Created: {tag.createdAt.toLocaleDateString()}</div>
                        {tag.updatedAt.getTime() !== tag.createdAt.getTime() && (
                          <div>Updated: {tag.updatedAt.toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(tag)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                        title="Edit tag"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        title="Delete tag"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
