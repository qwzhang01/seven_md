import React from 'react';

interface MenuItemProps {
  label: string;
  shortcut?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  label,
  shortcut,
  icon,
  disabled = false,
  onClick,
  title,
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  // Detect platform for styling
  const isWindows = navigator.platform.toLowerCase().includes('win');

  return (
    <button
      className={`
        w-full px-3 py-2 flex items-center justify-between
        text-sm text-left transition-colors duration-150
        focus:outline-none focus:bg-accent/10 focus:text-accent
        ${isWindows ? 'font-sans' : 'font-system-ui'}
        ${disabled 
          ? 'text-[--text-tertiary] cursor-not-allowed' 
          : 'text-[--text-primary] hover:bg-accent/10 hover:text-accent'
        }
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      title={title}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="w-4 h-4">{icon}</span>}
        <span>{label}</span>
      </div>
      {shortcut && (
        <span className="text-xs text-[--text-secondary] ml-4">
          {shortcut}
        </span>
      )}
    </button>
  );
};
