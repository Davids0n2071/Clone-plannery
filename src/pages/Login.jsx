import { useState } from "react"
import { Button } from "@/components/ui/button"
import { loginWithGoogle } from "@/lib/auth"

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function handleLogin() {
    setLoading(true)
    setError(null)
    try {
      await loginWithGoogle()
    } catch {
      setError("No se pudo iniciar sesión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center relative overflow-hidden"
         style={{ background: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 25%, #ede9fe 50%, #ddd6fe 75%, #fed7aa 100%)" }}>

      {/* Círculos decorativos de fondo */}
      <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full opacity-30"
           style={{ background: "radial-gradient(circle, #f9a8d4, transparent)" }} />
      <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 rounded-full opacity-20"
           style={{ background: "radial-gradient(circle, #c4b5fd, transparent)" }} />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full opacity-20"
           style={{ background: "radial-gradient(circle, #fdba74, transparent)" }} />

      {/* Card de login */}
      <div className="relative bg-white/80 backdrop-blur-sm border border-white
                      rounded-2xl shadow-xl p-10 flex flex-col items-center
                      gap-6 w-full max-w-sm mx-4">

        <div className="text-center">
          <p className="text-5xl mb-3">📍</p>
          <h1 className="text-2xl font-bold text-slate-800">Plannery</h1>
          <p className="text-sm text-slate-500 mt-1">Planea tu próxima salida</p>
        </div>

        <Button
          onClick={handleLogin}
          disabled={loading}
          variant="outline"
          className="w-full flex items-center gap-3 bg-white hover:bg-slate-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? "Iniciando sesión..." : "Continuar con Google"}
        </Button>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <p className="text-xs text-slate-400 text-center">
          Al continuar aceptas los términos de uso de Plannery
        </p>
      </div>
    </div>
  )
}