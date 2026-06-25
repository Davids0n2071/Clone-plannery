// src/App.jsx
// Este es el "portero" de la app.
// - Si Firebase aún está verificando: muestra pantalla de carga
// - Si hay usuario: muestra Home
// - Si no hay usuario: muestra Login

import { useAuth } from "@/hooks/useAuth"
import Home  from "@/pages/Home"
import Login from "@/pages/Login"

export default function App() {
  const { user, loading } = useAuth()

  // Mientras Firebase verifica si ya había sesión activa
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400 text-sm">Cargando...</p>
      </div>
    )
  }

  // Si hay usuario autenticado → Home; si no → Login
  return user ? <Home user={user} /> : <Login />
}