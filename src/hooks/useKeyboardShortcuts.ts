import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
  global?: boolean; // Global shortcuts work even in input fields
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check if target is in editor (CodeMirror uses contentEditable)
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    
    // Don't trigger non-global shortcuts when typing in input fields (unless it's Escape)
    if (isInputField && event.key !== 'Escape') {
      // Still allow global shortcuts to work
      const hasGlobalShortcut = shortcuts.some(s => s.global);
      if (!hasGlobalShortcut) {
        return;
      }
    }

    const platform = navigator.platform.toLowerCase();
    const isMac = platform.includes('mac');

    // Check if any shortcut matches
    for (const shortcut of shortcuts) {
      // Skip non-global shortcuts when in input field
      if (isInputField && !shortcut.global && event.key !== 'Escape') {
        continue;
      }

      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      
      // Handle Ctrl/Cmd key based on platform
      let modifierMatches = true;
      if (shortcut.ctrlKey || shortcut.metaKey) {
        // If shortcut requires Ctrl/Cmd
        modifierMatches = isMac ? event.metaKey : event.ctrlKey;
      } else {
        // No Ctrl/Cmd required - ensure neither is pressed
        modifierMatches = isMac ? !event.metaKey : !event.ctrlKey;
      }
      
      // Check Shift
      if (shortcut.shiftKey) {
        modifierMatches = modifierMatches && event.shiftKey;
      } else if (!shortcut.shiftKey && event.shiftKey && !shortcut.ctrlKey && !shortcut.metaKey) {
        // Only reject shift if it's a simple shortcut and shift is pressed
        modifierMatches = false;
      }
      
      // Check Alt
      if (shortcut.altKey) {
        modifierMatches = modifierMatches && event.altKey;
      } else if (event.altKey && !shortcut.altKey) {
        modifierMatches = false;
      }

      if (keyMatches && modifierMatches) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.action();
        return;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

// Platform-aware shortcut formatter
export const formatShortcut = (
  key: string,
  modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean }
): string => {
  const platform = navigator.platform.toLowerCase();
  const isMac = platform.includes('mac');

  const parts: string[] = [];

  if (modifiers?.ctrl) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (modifiers?.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (modifiers?.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }

  parts.push(key.length === 1 ? key.toUpperCase() : key);

  return isMac ? parts.join('') : parts.join('+');
};

// Helper to check platform
export const isMacOS = (): boolean => {
  return navigator.platform.toLowerCase().includes('mac');
};

// Get the modifier key symbol for current platform
export const getModifierKey = (): string => {
  return isMacOS() ? '⌘' : 'Ctrl';
};
