import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n/config' // Initialize i18n
import AppV2 from './AppV2.tsx'
import './index.css'
import './styles/themes.css' // CSS variable-based theme system
import './styles/reducedMotion.css' // Reduced motion support for accessibility
import './styles/focusIndicator.css' // Enhanced focus indicators for accessibility

// Apply saved theme before first render to prevent flash
const savedTheme = localStorage.getItem('md-mate-theme')
const themeData = savedTheme ? JSON.parse(savedTheme) : null
const initialTheme = themeData?.state?.currentTheme || 'dark'
document.documentElement.setAttribute('data-theme', initialTheme)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppV2 />
  </StrictMode>,
)