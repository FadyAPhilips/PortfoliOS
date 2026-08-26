import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 98.css first so our own layer can override its defaults.
import '98.css'
import './styles/index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
