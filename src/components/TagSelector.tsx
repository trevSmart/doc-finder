'use client';

import { useState, useEffect } from 'react';
import { useTags } from '@/contexts/TagContext';
import { TAG_COLORS } from '@/types/tag';
import {
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface TagSelectorProps {
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  disabled?: boolean;
}

export default function TagSelector({ selectedTagIds, onTagsChange, disabled = false }: TagSelectorProps) {
  const { tags } = useTags();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));
  const availableTags = tags.filter(tag => !selectedTagIds.includes(tag.id));

  const handleTagToggle = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      // Remove tag
      onTagsChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      // Add tag
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTagIds.filter(id => id !== tagId));
  };

  return (
    <div className="space-y-3">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags assignats
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => {
              const colorInfo = TAG_COLORS[tag.color];
              return (
                <span
                  key={tag.id}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${colorInfo.bgClass} ${colorInfo.textClass}`}
                >
                  {tag.text}
                  {!disabled && (
                    <button
                      onClick={() => handleRemoveTag(tag.id)}
                      className="ml-1 rounded-full p-0.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150"
                      title={`Remove ${tag.text} tag`}
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Tag Selector */}
      {!disabled && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Afegir tags
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  {availableTags.length > 0 ? 'Selecciona tags...' : 'No hi ha tags disponibles'}
                </span>
                <PlusIcon className="h-4 w-4 text-gray-400" />
              </div>
            </button>

            {isOpen && availableTags.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                <div className="max-h-60 overflow-auto py-1">
                  {availableTags.map((tag) => {
                    const colorInfo = TAG_COLORS[tag.color];
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          handleTagToggle(tag.id);
                          setIsOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                      >
                        <div className={`h-4 w-4 rounded-full ${colorInfo.bgClass} border border-gray-300 dark:border-gray-500`} />
                        <span className="text-gray-900 dark:text-white">{tag.text}</span>
                        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                          {colorInfo.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
