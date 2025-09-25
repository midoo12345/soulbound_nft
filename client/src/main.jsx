import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Remove HTML preloader once the bundle executes
const preRoot = document.getElementById('pre-root-loader')
if (preRoot) {
  setTimeout(() => {
    preRoot.parentNode && preRoot.parentNode.removeChild(preRoot)
  }, 0)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
