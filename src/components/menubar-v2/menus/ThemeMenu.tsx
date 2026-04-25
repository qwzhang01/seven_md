import type { MenuItemDef } from '../MenuBar'
import { MenuDropdown } from '../MenuDropdown'
import { useThemeStore } from '../../../stores'
import { allThemes } from '../../../themes'

interface ThemeMenuProps {
  onClose: () => void
}

export function ThemeMenu({ onClose }: ThemeMenuProps) {
  const { setTheme } = useThemeStore()

  const items: MenuItemDef[] = allThemes.map((theme) => ({
    label: `${theme.icon} ${theme.name}`,
    action: () => {
      setTheme(theme.id)
      onClose()
    },
  }))

  return <MenuDropdown items={items} onClose={onClose} />
}
