import React from 'react';
import { Modal } from '../Modal';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: { action: string; shortcut: string }[];
}

const isMac = navigator.platform.toLowerCase().includes('mac');
const mod = isMac ? '⌘' : 'Ctrl';

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'File',
    shortcuts: [
      { action: 'New File', shortcut: `${mod}N` },
      { action: 'Open File', shortcut: `${mod}O` },
      { action: 'Open Folder', shortcut: `${mod}Shift+O` },
      { action: 'Save', shortcut: `${mod}S` },
      { action: 'Save As', shortcut: `${mod}Shift+S` },
      { action: 'Export as PDF', shortcut: `${mod}Shift+P` },
      { action: 'Export as HTML', shortcut: `${mod}Shift+E` },
    ],
  },
  {
    title: 'Edit',
    shortcuts: [
      { action: 'Undo', shortcut: `${mod}Z` },
      { action: 'Redo', shortcut: `${mod}Shift+Z` },
      { action: 'Cut', shortcut: `${mod}X` },
      { action: 'Copy', shortcut: `${mod}C` },
      { action: 'Paste', shortcut: `${mod}V` },
      { action: 'Select All', shortcut: `${mod}A` },
      { action: 'Find', shortcut: `${mod}F` },
      { action: 'Replace', shortcut: `${mod}H` },
    ],
  },
  {
    title: 'View',
    shortcuts: [
      { action: 'Toggle Sidebar', shortcut: `${mod}B` },
      { action: 'Toggle Preview', shortcut: `${mod}P` },
      { action: 'Zoom In', shortcut: `${mod}+` },
      { action: 'Zoom Out', shortcut: `${mod}-` },
      { action: 'Reset Zoom', shortcut: `${mod}0` },
      { action: 'Full Screen', shortcut: isMac ? '⌘Ctrl+F' : 'F11' },
    ],
  },
  {
    title: 'Tabs',
    shortcuts: [
      { action: 'New Tab', shortcut: `${mod}N` },
      { action: 'Close Tab', shortcut: `${mod}W` },
      { action: 'Close All Tabs', shortcut: `${mod}Shift+W` },
      { action: 'Reopen Closed Tab', shortcut: `${mod}Shift+T` },
      { action: 'Next Tab', shortcut: `${mod}Tab` },
      { action: 'Previous Tab', shortcut: `${mod}Shift+Tab` },
      { action: 'Tab 1–9', shortcut: `${mod}1–9` },
      { action: 'Last Tab', shortcut: `${mod}0` },
      { action: 'Move Tab Left', shortcut: `${mod}Shift+PageUp` },
      { action: 'Move Tab Right', shortcut: `${mod}Shift+PageDown` },
      { action: 'Navigate Tabs (Alt)', shortcut: 'Alt+←/→' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { action: 'Open Menu', shortcut: 'Alt+F' },
      { action: 'Close Menu', shortcut: 'Escape' },
      { action: 'Navigate Menus', shortcut: '←/→' },
      { action: 'Navigate Items', shortcut: '↑/↓' },
    ],
  },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts">
      <div className="space-y-4">
        {shortcutGroups.map((group) => (
          <div key={group.title}>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.shortcuts.map((item) => (
                <div
                  key={item.action}
                  className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {item.action}
                  </span>
                  <kbd className="px-2 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded border border-gray-200 dark:border-gray-500">
                    {item.shortcut}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Tip: Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-600 rounded">Alt</kbd> + underlined letter to open menus
          </p>
        </div>
      </div>
    </Modal>
  );
};
