// src/components/map/MarkerFilter.jsx
import { X } from "lucide-react"

export default function MarkerFilter({ showPlans, showResults, onChange, onClear }) {

  const bothActive = showPlans && showResults

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10
                    flex items-center gap-2 bg-white rounded-xl shadow-lg
                    px-3 py-2 border border-slate-100">

      {/* Ver todos */}
      <button
        onClick={() => onChange({ showPlans: true, showResults: true })}
        className={`px-3 py-1.5 cursor-pointer rounded-lg text-xs font-medium transition-colors ${
          bothActive
            ? "bg-slate-800 text-white"
            : "text-slate-500 hover:bg-slate-50"
        }`}
      >
        Ver todos
      </button>

      <div className="w-px h-4 bg-slate-200" />

      {/* Toggle Mis planes */}
      <button
        onClick={() => onChange({ showPlans: !showPlans, showResults })}
        className={`flex items-center cursor-pointer gap-1.5 px-3 py-1.5 rounded-lg text-xs
                    font-medium transition-colors ${
          showPlans && !bothActive
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : showPlans
            ? "text-slate-600 hover:bg-slate-50"
            : "text-slate-400 hover:bg-slate-50 line-through"
        }`}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
        Mis planes
      </button>

      {/* Toggle Resultados */}
      <button
        onClick={() => onChange({ showPlans, showResults: !showResults })}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                    font-medium transition-colors cursor-pointer ${
          showResults && !bothActive
            ? "bg-red-50 text-red-700 border border-red-200"
            : showResults
            ? "text-slate-600 hover:bg-slate-50"
            : "text-slate-400 hover:bg-slate-50 line-through"
        }`}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
        Resultados
      </button>

      <div className="w-px h-4 bg-slate-200" />

      {/* Limpiar búsqueda */}
      <button
        onClick={onClear}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs
                   text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
        title="Limpiar búsqueda"
      >
        <X className="w-3.5 h-3.5" />
        Limpiar
      </button>

    </div>
  )
}