import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu } from '../MenuBar/Menu';
import { MenuItem } from '../MenuBar/MenuItem';
import { MenuSeparator } from '../MenuBar/MenuSeparator';
import { useMenuState } from '../../hooks/useMenuState';
import { useEditor } from '../../context/EditorContext';
import { Undo2, Redo2, Scissors, Copy, ClipboardPaste, Search, Replace } from 'lucide-react';

export const EditMenu: React.FC = () => {
  const { openMenu, setOpenMenu } = useMenuState();
  const { undo, redo, selectAll, openSearch, openReplace, cut, copy, paste } = useEditor();
  const [hasSelection, setHasSelection] = useState(false);
  const { t } = useTranslation();

  // Check if there's a selection in the editor
  useEffect(() => {
    const checkSelection = () => {
      const selection = window.getSelection();
      setHasSelection(selection !== null && selection.toString().length > 0);
    };
    
    document.addEventListener('selectionchange', checkSelection);
    return () => document.removeEventListener('selectionchange', checkSelection);
  }, []);

  const handleUndo = () => {
    undo();
    setOpenMenu(null);
  };

  const handleRedo = () => {
    redo();
    setOpenMenu(null);
  };

  const handleCut = () => {
    cut();
    setOpenMenu(null);
  };

  const handleCopy = () => {
    copy();
    setOpenMenu(null);
  };

  const handlePaste = async () => {
    await paste();
    setOpenMenu(null);
  };

  const handleSelectAll = () => {
    selectAll();
    setOpenMenu(null);
  };

  const handleFind = () => {
    openSearch();
    setOpenMenu(null);
  };

  const handleReplace = () => {
    openReplace();
    setOpenMenu(null);
  };

  return (
    <Menu
      label={t('menu.edit')}
      isOpen={openMenu === 'Edit'}
      onToggle={() => setOpenMenu(openMenu === 'Edit' ? null : 'Edit')}
      onMouseEnter={() => openMenu && setOpenMenu('Edit')}
    >
      <MenuItem
        label={t('menu.undo')}
        shortcut="⌘Z"
        icon={<Undo2 className="w-4 h-4" />}
        onClick={handleUndo}
      />
      
      <MenuItem
        label={t('menu.redo')}
        shortcut="⌘⇧Z"
        icon={<Redo2 className="w-4 h-4" />}
        onClick={handleRedo}
      />
      
      <MenuSeparator />
      
      <MenuItem
        label={t('menu.cut')}
        shortcut="⌘X"
        icon={<Scissors className="w-4 h-4" />}
        onClick={handleCut}
        disabled={!hasSelection}
      />
      
      <MenuItem
        label={t('menu.copy')}
        shortcut="⌘C"
        icon={<Copy className="w-4 h-4" />}
        onClick={handleCopy}
        disabled={!hasSelection}
      />
      
      <MenuItem
        label={t('menu.paste')}
        shortcut="⌘V"
        icon={<ClipboardPaste className="w-4 h-4" />}
        onClick={handlePaste}
      />
      
      <MenuItem
        label={t('menu.selectAll')}
        shortcut="⌘A"
        onClick={handleSelectAll}
      />
      
      <MenuSeparator />
      
      <MenuItem
        label={t('menu.find')}
        shortcut="⌘F"
        icon={<Search className="w-4 h-4" />}
        onClick={handleFind}
      />
      
      <MenuItem
        label={t('menu.replace')}
        shortcut="⌘H"
        icon={<Replace className="w-4 h-4" />}
        onClick={handleReplace}
      />
    </Menu>
  );
};
