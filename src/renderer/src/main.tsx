import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { PaletteView } from './components/PaletteView'

const isPalette =
  window.location.hash === '#palette' || window.location.search.includes('palette=1')

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isPalette ? <PaletteView /> : <App />}</StrictMode>
)
