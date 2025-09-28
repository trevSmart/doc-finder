'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FileTagsContextType {
  fileTags: Record<string, string[]>; // filePath -> tagIds[]
  addTagToFile: (filePath: string, tagId: string) => void;
  removeTagFromFile: (filePath: string, tagId: string) => void;
  setFileTags: (filePath: string, tagIds: string[]) => void;
  getFileTags: (filePath: string) => string[];
  isLoading: boolean;
}

const FileTagsContext = createContext<FileTagsContextType | undefined>(undefined);

const STORAGE_KEY = 'docfinder-file-tags';

export function FileTagsProvider({ children }: { children: ReactNode }) {
  const [fileTags, setFileTagsState] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load file tags from localStorage on mount
  useEffect(() => {
    try {
      const storedFileTags = localStorage.getItem(STORAGE_KEY);
      if (storedFileTags) {
        setFileTagsState(JSON.parse(storedFileTags));
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading file tags from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save file tags to localStorage whenever fileTags change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fileTags));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error saving file tags to localStorage:', error);
      }
    }
  }, [fileTags, isLoading]);

  const addTagToFile = (filePath: string, tagId: string) => {
    setFileTagsState(prev => ({
      ...prev,
      [filePath]: [...(prev[filePath] || []), tagId]
    }));
  };

  const removeTagFromFile = (filePath: string, tagId: string) => {
    setFileTagsState(prev => ({
      ...prev,
      [filePath]: (prev[filePath] || []).filter(id => id !== tagId)
    }));
  };

  const setFileTags = (filePath: string, tagIds: string[]) => {
    setFileTagsState(prev => ({
      ...prev,
      [filePath]: tagIds
    }));
  };

  const getFileTags = (filePath: string) => {
    return fileTags[filePath] || [];
  };

  const value: FileTagsContextType = {
    fileTags,
    addTagToFile,
    removeTagFromFile,
    setFileTags,
    getFileTags,
    isLoading,
  };

  return <FileTagsContext.Provider value={value}>{children}</FileTagsContext.Provider>;
}

export function useFileTags() {
  const context = useContext(FileTagsContext);
  if (context === undefined) {
    throw new Error('useFileTags must be used within a FileTagsProvider');
  }
  return context;
}
