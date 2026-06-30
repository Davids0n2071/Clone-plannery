import { Button } from "@/components/ui/button"
import { Trash2, Star, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function PlansList({ plans, loading, onDelete }) {

  if (loading) {
    return (
      <div className="flex flex-col gap-3 flex-1">
        {[1,2,3,4].map(i => (
          <div key={i} className="rounded-xl overflow-hidden border border-slate-100 bg-white">
            <Skeleton className="w-full h-24" />
            <div className="p-3 flex flex-col gap-2">
              <Skeleton className="h-3 w-3/4 rounded-full" />
              <Skeleton className="h-3 w-1/2 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400">
        <MapPin className="w-8 h-8 opacity-30" />
        <p className="text-sm">Sin planes aún</p>
        <p className="text-xs text-center">Busca un lugar en el mapa y guárdalo aquí</p>
      </div>
    )
  }

  return (
    // min-h-0 es clave para que overflow-y-auto funcione dentro de flex
    <div className="flex-1 overflow-y-auto min-h-0 pr-1">
      <div className="flex flex-col gap-2">
        {plans.map((plan) => (
          <div key={plan.id}
               className="border border-slate-100 rounded-xl p-3 flex flex-col gap-1
                          hover:border-slate-300 transition-colors bg-white">

            {plan.photo_url && (
              <img src={plan.photo_url} alt={plan.name}
                className="w-full h-24 object-cover rounded-lg mb-1" />
            )}

            <p className="font-medium text-slate-800 text-sm leading-tight">
              {plan.name}
            </p>

            {plan.address && (
              <p className="text-xs text-slate-500 leading-tight">{plan.address}</p>
            )}

            <div className="flex items-center justify-between mt-1">
              {/* Rating más visible */}
              {plan.rating ? (
                <Badge className="gap-1 bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-50">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    {plan.rating}
                </Badge>
              ) : <span />}
              {plan.category && (
                <Badge variant="secondary" className="w-fit text-xs">
                  {plan.category}
                </Badge>
              )}

              <Button variant="ghost" size="icon"
                className="h-7 w-7 text-slate-400 hover:text-red-500"
                onClick={() => onDelete(plan.id)}>
                <Trash2 className="w-3.5 h-3.5 cursor-pointer" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}