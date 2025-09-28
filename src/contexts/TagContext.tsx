'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tag, TagFormData } from '@/types/tag';

interface TagContextType {
  tags: Tag[];
  createTag: (tagData: TagFormData) => void;
  updateTag: (id: string, tagData: TagFormData) => void;
  deleteTag: (id: string) => void;
  getTagById: (id: string) => Tag | undefined;
  isLoading: boolean;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

const STORAGE_KEY = 'docfinder-tags';

export function TagProvider({ children }: { children: ReactNode }) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tags from localStorage on mount
  useEffect(() => {
    try {
      const storedTags = localStorage.getItem(STORAGE_KEY);
      if (storedTags) {
        const parsedTags = JSON.parse(storedTags).map((tag: Tag) => ({
          ...tag,
          createdAt: new Date(tag.createdAt),
          updatedAt: new Date(tag.updatedAt),
        }));
        setTags(parsedTags);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading tags from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save tags to localStorage whenever tags change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error saving tags to localStorage:', error);
      }
    }
  }, [tags, isLoading]);

  const createTag = (tagData: TagFormData) => {
    const newTag: Tag = {
      id: crypto.randomUUID(),
      text: tagData.text.trim(),
      color: tagData.color,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTags(prevTags => [...prevTags, newTag]);
  };

  const updateTag = (id: string, tagData: TagFormData) => {
    setTags(prevTags =>
      prevTags.map(tag =>
        tag.id === id
          ? {
              ...tag,
              text: tagData.text.trim(),
              color: tagData.color,
              updatedAt: new Date(),
            }
          : tag
      )
    );
  };

  const deleteTag = (id: string) => {
    setTags(prevTags => prevTags.filter(tag => tag.id !== id));
  };

  const getTagById = (id: string) => {
    return tags.find(tag => tag.id === id);
  };

  const value: TagContextType = {
    tags,
    createTag,
    updateTag,
    deleteTag,
    getTagById,
    isLoading,
  };

  return <TagContext.Provider value={value}>{children}</TagContext.Provider>;
}

export function useTags() {
  const context = useContext(TagContext);
  if (context === undefined) {
    throw new Error('useTags must be used within a TagProvider');
  }
  return context;
}
