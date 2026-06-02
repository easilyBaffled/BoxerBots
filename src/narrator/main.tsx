import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../global.css'
import NarratorApp from './NarratorApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NarratorApp />
  </StrictMode>,
)
