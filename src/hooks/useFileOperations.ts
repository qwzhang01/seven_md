import { useState, useCallback } from 'react';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readFile, saveFile } from '../tauriCommands';
import { useAppState } from '../context/AppContext';
import { createLogger } from '../utils/logger';

const logger = createLogger('useFileOperations');

export const useFileOperations = () => {
  const { state, dispatch } = useAppState();
  const [isSaving, setIsSaving] = useState(false);

  // Derive active tab
  const activeTab = state.tabs.tabs.find(t => t.id === state.tabs.activeTabId) ?? null;
  const activeTabId = state.tabs.activeTabId;

  const openFile = useCallback(async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Markdown',
          extensions: ['md', 'markdown']
        }]
      });
      
      if (selected && typeof selected === 'string') {
        const content = await readFile(selected);
        dispatch({ type: 'OPEN_TAB', payload: { path: selected, content } });
        return selected;
      }
      return null;
    } catch (error) {
      logger.error('Failed to open file', { error: String(error) });
      throw error;
    }
  }, [dispatch]);

  const saveCurrentFile = useCallback(async () => {
    if (!activeTab) return false;
    if (!activeTab.path) {
      return saveFileAs();
    }

    try {
      setIsSaving(true);
      await saveFile(activeTab.path, activeTab.content);
      if (activeTabId) {
        dispatch({ type: 'SET_TAB_DIRTY', payload: { tabId: activeTabId, isDirty: false } });
      }
      return true;
    } catch (error) {
      logger.error('Failed to save file', { error: String(error), path: activeTab.path });
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [activeTab, activeTabId, dispatch]);

  const saveFileAs = useCallback(async () => {
    if (!activeTab || !activeTabId) return false;
    try {
      setIsSaving(true);
      const selected = await save({
        filters: [{
          name: 'Markdown',
          extensions: ['md', 'markdown']
        }]
      });
      
      if (selected && typeof selected === 'string') {
        await saveFile(selected, activeTab.content);
        dispatch({ type: 'UPDATE_TAB_PATH', payload: { tabId: activeTabId, path: selected } });
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to save file as', { error: String(error) });
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [activeTab, activeTabId, dispatch]);

  const newFile = useCallback(() => {
    dispatch({ type: 'OPEN_TAB', payload: { path: null, content: '' } });
  }, [dispatch]);

  return {
    openFile,
    saveCurrentFile,
    saveFileAs,
    newFile,
    isSaving,
    currentFilePath: activeTab?.path ?? null,
    isDirty: activeTab?.isDirty ?? false,
    hasUnsavedChanges: activeTab?.isDirty ?? false
  };
};
