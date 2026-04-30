import { useState, useEffect, useCallback } from 'react';
import { createLogger } from '../utils/logger';

const logger = createLogger('useRecentFiles');
const STORAGE_KEY = 'recent-documents';
const MAX_RECENT_FILES = 10;

export interface RecentFile {
  path: string;
  name: string;
  lastOpened: number;
  type: 'file' | 'folder';
}

export const useRecentFiles = () => {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  // Load recent files from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const files = JSON.parse(stored) as RecentFile[];
        setRecentFiles(files);
      } catch (error) {
        logger.error('Failed to load recent files', { error: String(error) });
        setRecentFiles([]);
      }
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (recentFiles.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentFiles));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [recentFiles]);

  const addRecentFile = useCallback((path: string, type: 'file' | 'folder') => {
    const name = path.split('/').pop() || path;

    setRecentFiles(prev => {
      // Remove if already exists
      const filtered = prev.filter(f => f.path !== path);

      // Add new file at the beginning
      const newFile: RecentFile = {
        path,
        name,
        lastOpened: Date.now(),
        type
      };

      // Keep only the last MAX_RECENT_FILES
      return [newFile, ...filtered].slice(0, MAX_RECENT_FILES);
    });
  }, []);

  const removeRecentFile = useCallback((path: string) => {
    setRecentFiles(prev => prev.filter(f => f.path !== path));
  }, []);

  const clearRecentFiles = useCallback(() => {
    setRecentFiles([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    recentFiles,
    addRecentFile,
    removeRecentFile,
    clearRecentFiles
  };
};
