import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface MenuStateContextType {
  openMenu: string | null;
  setOpenMenu: (menu: string | null) => void;
  closeMenu: () => void;
}

const MenuStateContext = createContext<MenuStateContextType | undefined>(undefined);

export const MenuStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const closeMenu = useCallback(() => {
    setOpenMenu(null);
  }, []);

  return (
    <MenuStateContext.Provider value={{ openMenu, setOpenMenu, closeMenu }}>
      {children}
    </MenuStateContext.Provider>
  );
};

export const useMenuState = (): MenuStateContextType => {
  const context = useContext(MenuStateContext);
  if (!context) {
    throw new Error('useMenuState must be used within MenuStateProvider');
  }
  return context;
};
