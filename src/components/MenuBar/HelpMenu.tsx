import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu } from '../MenuBar/Menu';
import { MenuItem } from '../MenuBar/MenuItem';
import { MenuSeparator } from '../MenuBar/MenuSeparator';
import { useMenuState } from '../../hooks/useMenuState';
import { AboutModal, KeyboardShortcutsModal } from '../Modal';
import { Info, Keyboard, BookOpen, Github } from 'lucide-react';
import { createLogger } from '../../utils/logger';

const logger = createLogger('HelpMenu');

// Open URL in external browser
const openExternal = async (url: string): Promise<void> => {
  try {
    // For Tauri 2.x, we use window.open which will be handled by the shell plugin
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (error) {
    logger.error('Failed to open external URL', { error: String(error) });
  }
};

export const HelpMenu: React.FC = () => {
  const { openMenu, setOpenMenu } = useMenuState();
  const [showAbout, setShowAbout] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { t } = useTranslation();

  const handleAbout = () => {
    // ... existing code ...
  };

  const handleKeyboardShortcuts = () => {
    // ... existing code ...
  };

  const handleDocumentation = async () => {
    await openExternal('https://github.com/avinzhang/seven-md#readme');
    setOpenMenu(null);
  };

  const handleGithub = async () => {
    await openExternal('https://github.com/avinzhang/seven-md');
    setOpenMenu(null);
  };

  return (
    <>
      <Menu
        label={t('menu.help')}
        isOpen={openMenu === 'Help'}
        onToggle={() => setOpenMenu(openMenu === 'Help' ? null : 'Help')}
        onMouseEnter={() => openMenu && setOpenMenu('Help')}
      >
        <MenuItem
          label={t('menu.aboutApp')}
          icon={<Info className="w-4 h-4" />}
          onClick={handleAbout}
        />
        
        <MenuItem
          label={t('menu.keyboardShortcuts')}
          shortcut="⌘/"
          icon={<Keyboard className="w-4 h-4" />}
          onClick={handleKeyboardShortcuts}
        />
        
        <MenuSeparator />
        
        <MenuItem
          label={t('menu.documentation')}
          icon={<BookOpen className="w-4 h-4" />}
          onClick={handleDocumentation}
        />
        
        <MenuItem
          label={t('menu.githubRepository')}
          icon={<Github className="w-4 h-4" />}
          onClick={handleGithub}
        />
      </Menu>

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </>
  );
};
