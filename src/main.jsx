// src/main.jsx
// APIProvider le da acceso a Google Maps a toda la app.
// Tu API key va aquí una sola vez.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { APIProvider } from '@vis.gl/react-google-maps'
import './index.css'
import App from './App.jsx'

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <APIProvider apiKey={MAPS_API_KEY}>
      <App />
    </APIProvider>
  </StrictMode>,
)