import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useMenuState } from '../../hooks/useMenuState';

interface MenuProps {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  onMouseEnter: () => void;
  children: React.ReactNode;
}

export const Menu: React.FC<MenuProps> = ({
  label,
  isOpen,
  onToggle,
  onMouseEnter,
  children,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { closeMenu } = useMenuState();
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');

  // Smart positioning - detect viewport boundaries
  useEffect(() => {
    if (isOpen && dropdownRef.current && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setPosition('top');
      } else {
        setPosition('bottom');
      }
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeMenu]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          closeMenu();
          buttonRef.current?.focus();
          break;
        case 'ArrowDown':
          event.preventDefault();
          const firstItem = menuRef.current?.querySelector('[role="menuitem"]');
          (firstItem as HTMLElement)?.focus();
          break;
        case 'ArrowUp':
          event.preventDefault();
          const items = menuRef.current?.querySelectorAll('[role="menuitem"]');
          if (items && items.length > 0) {
            (items[items.length - 1] as HTMLElement)?.focus();
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeMenu]);

  return (
    <div
      ref={menuRef}
      className="relative h-full flex items-center"
      role="presentation"
      aria-label={`${label} menu`}
      onMouseEnter={onMouseEnter}
    >
      <button
        ref={buttonRef}
        className={`
          px-3 py-1 text-sm font-medium rounded
          transition-colors duration-150
          ${isOpen 
            ? 'bg-accent/10 text-accent' 
            : 'text-[--text-primary] hover:bg-[--bg-tertiary]'
          }
        `}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown className="inline-block ml-1 w-3 h-3" />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
            absolute min-w-[200px] py-1 rounded-lg shadow-lg 
            border border-[--border-color] bg-[--bg-primary] z-50
            ${position === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'}
            left-0
          `}
          role="menu"
        >
          {children}
        </div>
      )}
    </div>
  );
};
