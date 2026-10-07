import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './language'
import { AccessibilityTools } from './accessibility'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider><App /><AccessibilityTools /></LanguageProvider>
  </StrictMode>,
)
