// Navbar.jsx — barra de navegación superior
import { Button } from "@/components/ui/button"

export default function Navbar() {
  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6">
      {/* Logo / nombre de la app */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-slate-800">📍 Plannery</span>
      </div>

      {/* Navegación central */}
      <nav className="flex gap-6 text-sm text-slate-600">
        <a href="#" className="hover:text-slate-900 transition-colors">Mapa</a>
        <a href="#" className="hover:text-slate-900 transition-colors">Mis planes</a>
        <a href="#" className="hover:text-slate-900 transition-colors">Chat IA</a>
      </nav>

      {/* Botón de acción — usando shadcn/ui */}
      <Button size="sm">Iniciar sesión</Button>
    </header>
  )
}