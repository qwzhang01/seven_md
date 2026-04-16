import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu } from '../MenuBar/Menu';
import { MenuItem } from '../MenuBar/MenuItem';
import { MenuSeparator } from '../MenuBar/MenuSeparator';
import { useMenuState } from '../../hooks/useMenuState';
import { useSidebarState, usePaneState } from '../../hooks/useAppState';
import { useAppState } from '../../context/AppContext';
import { PanelLeft, Eye, ZoomIn, ZoomOut, Maximize, ChevronLeft, ChevronRight } from 'lucide-react';
import { createLogger } from '../../utils/logger';

const logger = createLogger('ViewMenu');

const MIN_ZOOM = 10;
const MAX_ZOOM = 32;
const DEFAULT_ZOOM = 14;
const ZOOM_STEP = 2;

export const ViewMenu: React.FC = () => {
  const { openMenu, setOpenMenu } = useMenuState();
  const { collapsed: sidebarCollapsed, toggle: toggleSidebar } = useSidebarState();
const { previewCollapsed, togglePreview } = usePaneState();
  const { state, dispatch } = useAppState();
  const zoomLevel = state.ui.zoomLevel;
  const { t } = useTranslation();

  const handleToggleSidebar = () => {
    // ... existing code ...
  };

  const handleTogglePreview = () => {
    // ... existing code ...
  };

  const handleZoomIn = () => {
    const newLevel = Math.min(zoomLevel + ZOOM_STEP, MAX_ZOOM);
    dispatch({ type: 'SET_ZOOM_LEVEL', payload: newLevel });
    logger.debug('Zoom In', { newLevel });
    setOpenMenu(null);
  };

  const handleZoomOut = () => {
    const newLevel = Math.max(zoomLevel - ZOOM_STEP, MIN_ZOOM);
    dispatch({ type: 'SET_ZOOM_LEVEL', payload: newLevel });
    logger.debug('Zoom Out', { newLevel });
    setOpenMenu(null);
  };

  const handleResetZoom = () => {
    dispatch({ type: 'SET_ZOOM_LEVEL', payload: DEFAULT_ZOOM });
    logger.debug('Reset Zoom', { newLevel: DEFAULT_ZOOM });
    setOpenMenu(null);
  };

  const handleFullScreen = async () => {
    // ... existing code ...
  };

  const zoomPercentage = Math.round((zoomLevel / DEFAULT_ZOOM) * 100);

  return (
    <Menu
      label={t('menu.view')}
      isOpen={openMenu === 'View'}
      onToggle={() => setOpenMenu(openMenu === 'View' ? null : 'View')}
      onMouseEnter={() => openMenu && setOpenMenu('View')}
    >
      <MenuItem
        label={sidebarCollapsed ? t('menu.showSidebar') : t('menu.hideSidebar')}
        shortcut="⌘B"
        icon={<PanelLeft className="w-4 h-4" />}
        onClick={handleToggleSidebar}
      />
      
      <MenuItem
        label={previewCollapsed ? t('menu.showPreview') : t('menu.hidePreview')}
        shortcut="⌘P"
        icon={<Eye className="w-4 h-4" />}
        onClick={handleTogglePreview}
      />

      <MenuSeparator />

      {/* Tab navigation */}
      <MenuItem
        label="Next Tab"
        shortcut="⌘⇥"
        icon={<ChevronRight className="w-4 h-4" />}
        onClick={() => {
          const tabs = state.tabs.tabs
          if (tabs.length < 2) return
          const idx = tabs.findIndex(t => t.id === state.tabs.activeTabId)
          dispatch({ type: 'SWITCH_TAB', payload: tabs[(idx + 1) % tabs.length].id })
          setOpenMenu(null)
        }}
        disabled={state.tabs.tabs.length < 2}
      />
      <MenuItem
        label="Previous Tab"
        shortcut="⌘⇧⇥"
        icon={<ChevronLeft className="w-4 h-4" />}
        onClick={() => {
          const tabs = state.tabs.tabs
          if (tabs.length < 2) return
          const idx = tabs.findIndex(t => t.id === state.tabs.activeTabId)
          dispatch({ type: 'SWITCH_TAB', payload: tabs[(idx - 1 + tabs.length) % tabs.length].id })
          setOpenMenu(null)
        }}
        disabled={state.tabs.tabs.length < 2}
      />
      
      <MenuSeparator />
      
      <MenuItem
        label={`${t('menu.zoomIn')} (${zoomPercentage}%)`}
        shortcut="⌘+"
        icon={<ZoomIn className="w-4 h-4" />}
        onClick={handleZoomIn}
        disabled={zoomLevel >= MAX_ZOOM}
      />
      
      <MenuItem
        label={`${t('menu.zoomOut')} (${zoomPercentage}%)`}
        shortcut="⌘-"
        icon={<ZoomOut className="w-4 h-4" />}
        onClick={handleZoomOut}
        disabled={zoomLevel <= MIN_ZOOM}
      />
      
      <MenuItem
        label={t('menu.resetZoom')}
        shortcut="⌘0"
        onClick={handleResetZoom}
        disabled={zoomLevel === DEFAULT_ZOOM}
      />
      
      <MenuSeparator />
      
      <MenuItem
        label={t('menu.fullscreen')}
        shortcut="F11"
        icon={<Maximize className="w-4 h-4" />}
        onClick={handleFullScreen}
      />
    </Menu>
  );
};
