import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu } from '../MenuBar/Menu';
import { MenuItem } from '../MenuBar/MenuItem';
import { MenuSeparator } from '../MenuBar/MenuSeparator';
import { useMenuState } from '../../hooks/useMenuState';
import { useFileOperations } from '../../hooks/useFileOperations';
import { useFolder } from '../../hooks/useAppState';
import { useRecentFiles, RecentFile } from '../../hooks/useRecentFiles';
import { useTabManagement } from '../../hooks/useTabManagement';
import { useAppState } from '../../context/AppContext';
import { useExport } from '../../hooks/useExport';
import { readFile } from '../../tauriCommands';
import { FileText, FolderOpen, Save, FilePlus, X, RotateCcw, Download } from 'lucide-react';
import { createLogger } from '../../utils/logger';

const logger = createLogger('FileMenu');

export const FileMenu: React.FC = () => {
  const { openMenu, setOpenMenu } = useMenuState();
  const { 
    openFile, 
    saveCurrentFile, 
    saveFileAs, 
    newFile,
    currentFilePath,
    isDirty 
  } = useFileOperations();
  const { openFolder } = useFolder();
  const { recentFiles, addRecentFile, removeRecentFile, clearRecentFiles } = useRecentFiles();
  const { tabs, canReopenClosed, reopenLastClosedTab } = useTabManagement();
  const { state, dispatch } = useAppState();
  const { t } = useTranslation();

  // Derive active tab for export
  const activeTab = state.tabs.tabs.find(t => t.id === state.tabs.activeTabId) ?? null;
  const activeContent = activeTab?.content ?? '';
  const activeFilePath = activeTab?.path ?? null;
  const canExport = activeContent.trim() !== '';

  const { exportPdf, exportHtml } = useExport(activeContent, activeFilePath);

  const handleOpenFile = async () => {
    try {
      const path = await openFile();
      if (path) {
        addRecentFile(path, 'file');
      }
    } catch (error) {
      logger.error('Failed to open file', { error: String(error) });
    }
    setOpenMenu(null);
  };

  const handleOpenFolder = async () => {
    try {
      const path = await openFolder();
      if (path) {
        addRecentFile(path, 'folder');
      }
    } catch (error) {
      logger.error('Failed to open folder', { error: String(error) });
    }
    setOpenMenu(null);
  };

  const handleSave = async () => {
    try {
      await saveCurrentFile();
    } catch (error) {
      logger.error('Failed to save file', { error: String(error) });
    }
    setOpenMenu(null);
  };

  const handleSaveAll = async () => {
    const dirtyTabs = tabs.filter(t => t.isDirty && t.path)
    for (const tab of dirtyTabs) {
      try {
        const { saveFile } = await import('../../tauriCommands')
        await saveFile(tab.path!, tab.content)
        dispatch({ type: 'SET_TAB_DIRTY', payload: { tabId: tab.id, isDirty: false } })
      } catch (error) {
        logger.error('Failed to save tab', { error: String(error), path: tab.path })
      }
    }
    setOpenMenu(null)
  }

  const handleSaveAs = async () => {
    try {
      await saveFileAs();
    } catch (error) {
      logger.error('Failed to save file as', { error: String(error) });
    }
    setOpenMenu(null);
  };

  const handleNewFile = () => {
    newFile();
    setOpenMenu(null);
  };

  const handleCloseTab = () => {
    // Use the active tab from state
    const activeTabId = state.tabs.activeTabId
    if (activeTabId) dispatch({ type: 'CLOSE_TAB', payload: activeTabId })
    setOpenMenu(null)
  }

  const handleCloseAllTabs = () => {
    dispatch({ type: 'CLOSE_ALL_TABS' });
    setOpenMenu(null);
  };

  const handleReopenClosedTab = async () => {
    await reopenLastClosedTab();
    setOpenMenu(null);
  };

  const handleClearTabHistory = () => {
    dispatch({ type: 'CLEAR_RECENTLY_CLOSED' })
    setOpenMenu(null)
  }

  const handleOpenRecent = async (recent: RecentFile) => {
    try {
      if (recent.type === 'file') {
        // Check if already open in a tab
        const existingTab = tabs.find(t => t.path === recent.path);
        if (existingTab) {
          dispatch({ type: 'SWITCH_TAB', payload: existingTab.id });
          addRecentFile(recent.path, 'file');
        } else {
          const content = await readFile(recent.path);
          dispatch({ type: 'OPEN_TAB', payload: { path: recent.path, content } });
          addRecentFile(recent.path, 'file');
        }
      } else {
        await openFolder();
        addRecentFile(recent.path, 'folder');
      }
    } catch (error) {
      logger.error('Failed to open recent', { error: String(error), path: recent.path });
      removeRecentFile(recent.path);
    }
    setOpenMenu(null);
  };

  const handleClearRecent = () => {
    clearRecentFiles();
  };

  const handleExportPdf = async () => {
    console.log('[FileMenu] handleExportPdf called, canExport:', canExport);
    setOpenMenu(null);
    try {
      await exportPdf();
      console.log('[FileMenu] exportPdf completed');
    } catch (error) {
      console.error('[FileMenu] exportPdf error:', error);
    }
  };

  const handleExportHtml = async () => {
    console.log('[FileMenu] handleExportHtml called, canExport:', canExport);
    setOpenMenu(null);
    try {
      await exportHtml();
      console.log('[FileMenu] exportHtml completed');
    } catch (error) {
      console.error('[FileMenu] exportHtml error:', error);
    }
  };

  const handleExit = () => {
    setOpenMenu(null);
  };

  // Note: Native menu export events are handled in App.tsx
  // This component handles internal menu clicks via onClick handlers

  return (
    <Menu
      label={t('menu.file')}
      isOpen={openMenu === 'File'}
      onToggle={() => setOpenMenu(openMenu === 'File' ? null : 'File')}
      onMouseEnter={() => openMenu && setOpenMenu('File')}
    >
      <MenuItem
        label={t('menu.newFile')}
        shortcut="⌘N"
        icon={<FilePlus className="w-4 h-4" />}
        onClick={handleNewFile}
      />
      
      <MenuItem
        label={t('menu.openFile')}
        shortcut="⌘O"
        icon={<FileText className="w-4 h-4" />}
        onClick={handleOpenFile}
      />
      
      <MenuItem
        label={t('menu.openFolder')}
        shortcut="⌘⇧O"
        icon={<FolderOpen className="w-4 h-4" />}
        onClick={handleOpenFolder}
      />
      
      <MenuSeparator />
      
      <MenuItem
        label={t('common.save')}
        shortcut="⌘S"
        icon={<Save className="w-4 h-4" />}
        onClick={handleSave}
        disabled={!currentFilePath && !isDirty}
      />
      
      <MenuItem
        label={t('menu.saveAs')}
        shortcut="⌘⇧S"
        icon={<Save className="w-4 h-4" />}
        onClick={handleSaveAs}
        disabled={!isDirty && !currentFilePath}
      />

      <MenuItem
        label="Save All"
        shortcut="⌘⌥S"
        icon={<Save className="w-4 h-4" />}
        onClick={handleSaveAll}
        disabled={!tabs.some(t => t.isDirty && t.path)}
      />

      <MenuSeparator />

      {/* Export submenu */}
      <div className="px-3 py-1 text-xs text-[--text-secondary] font-semibold">
        {t('menu.export')}
      </div>
      <MenuItem
        label={t('menu.exportAsPdf')}
        shortcut="⌘⇧P"
        icon={<Download className="w-4 h-4" />}
        onClick={handleExportPdf}
        disabled={!canExport}
      />
      <MenuItem
        label={t('menu.exportAsHtml')}
        shortcut="⌘⇧E"
        icon={<Download className="w-4 h-4" />}
        onClick={handleExportHtml}
        disabled={!canExport}
      />

      <MenuSeparator />

      {/* Tab operations */}
      <MenuItem
        label="Close Tab"
        shortcut="⌘W"
        icon={<X className="w-4 h-4" />}
        onClick={handleCloseTab}
        disabled={tabs.length === 0}
      />

      <MenuItem
        label="Close All Tabs"
        shortcut="⌘⇧W"
        icon={<X className="w-4 h-4" />}
        onClick={handleCloseAllTabs}
        disabled={tabs.length === 0}
      />

      <MenuItem
        label="Reopen Closed Tab"
        shortcut="⌘⇧T"
        icon={<RotateCcw className="w-4 h-4" />}
        onClick={handleReopenClosedTab}
        disabled={!canReopenClosed}
      />

      <MenuItem
        label="Clear Tab History"
        icon={<X className="w-4 h-4" />}
        onClick={handleClearTabHistory}
        disabled={!canReopenClosed}
      />
      
      <MenuSeparator />
      
      {/* Recent Files Submenu */}
      {recentFiles.length > 0 && (
        <>
          <div className="px-3 py-1 text-xs text-[--text-secondary] font-semibold">
            {t('menu.recentFiles')}
          </div>
          {recentFiles.slice(0, 10).map((file) => {
            const openTab = tabs.find(t => t.path === file.path)
            const tabIndex = openTab ? tabs.indexOf(openTab) + 1 : null
            const tooltip = openTab
              ? `Currently open in Tab ${tabIndex}`
              : file.path
            return (
              <MenuItem
                key={file.path}
                label={file.name}
                title={tooltip}
                icon={
                  file.type === 'folder'
                    ? <FolderOpen className="w-4 h-4" />
                    : <FileText className={`w-4 h-4 ${openTab ? 'text-blue-500' : ''}`} />
                }
                onClick={() => handleOpenRecent(file)}
              />
            )
          })}
          <MenuItem
            label={t('menu.clearRecentFiles')}
            icon={<X className="w-4 h-4" />}
            onClick={handleClearRecent}
          />
          <MenuSeparator />
        </>
      )}
      
      <MenuItem
        label={t('menu.exit')}
        icon={<X className="w-4 h-4" />}
        onClick={handleExit}
      />
    </Menu>
  );
};
