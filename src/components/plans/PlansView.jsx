import { Trash2, Star, MapPin, Map } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PlansView({ plans, loading, onDelete, onViewInMap }) {

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        Cargando planes...
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400 px-6">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
          <MapPin className="w-10 h-10 opacity-30" />
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-slate-600">
            Aún no tienes planes guardados
          </p>
          <p className="text-sm mt-1">
            Busca lugares en el mapa y guárdalos aquí
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-xl font-bold text-slate-800 mb-6">
        Mis planes ({plans.length})
      </h1>

      {/* Grilla responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {plans.map(plan => (
          <div key={plan.id}
               className="bg-white border border-slate-100 rounded-2xl overflow-hidden
                          shadow-sm hover:shadow-md transition-shadow flex flex-col">

            {plan.photo_url ? (
              <img src={plan.photo_url} alt={plan.name}
                className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-slate-100 flex items-center justify-center text-4xl">
                📍
              </div>
            )}

            <div className="p-4 flex flex-col gap-2 flex-1">
              <p className="font-semibold text-slate-800 leading-tight">{plan.name}</p>

              {plan.address && (
                <p className="text-xs text-slate-500 leading-relaxed">{plan.address}</p>
              )}

              {/* Rating */}
              {plan.rating && (
                <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-200
                                rounded-full px-2 py-1 w-fit">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-700">{plan.rating}</span>
                </div>
              )}

              {/* Acciones */}
              <div className="flex gap-2 mt-auto pt-2">
                {/* Ver en mapa — navega a la vista del mapa y centra en este lugar */}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 text-xs"
                  onClick={() => onViewInMap(plan)}
                >
                  <Map className="w-3.5 h-3.5" />
                  Ver en mapa
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-red-500 shrink-0"
                  onClick={() => onDelete(plan.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}