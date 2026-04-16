import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n/config' // Initialize i18n
import App from './App.tsx'
import './index.css'
import './styles/reducedMotion.css' // Reduced motion support for accessibility
import './styles/focusIndicator.css' // Enhanced focus indicators for accessibility

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)