import { Trash2, Star, MapPin, Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function PlansView({ plans, loading, onDelete, onViewInMap }) {


  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <Skeleton className="h-7 w-48 rounded-full mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
              <Skeleton className="w-full h-40" />
              <div className="p-4 flex flex-col gap-3">
                <Skeleton className="h-4 w-3/4 rounded-full" />
                <Skeleton className="h-3 w-full rounded-full" />
                <Skeleton className="h-3 w-2/3 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-8 flex-1 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
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
          <Card key={plan.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            {plan.photo_url ? (
              <img src={plan.photo_url} alt={plan.name}
                className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-slate-100 flex items-center justify-center text-4xl">
                📍
              </div>
            )}

            <CardContent className="flex flex-col gap-2 flex-1 pt-4">
              <p className="font-semibold text-slate-800 leading-tight">{plan.name}</p>

              {plan.address && (
                <p className="text-xs text-slate-500 leading-relaxed">{plan.address}</p>
              )}

              {/* Rating */}
              {plan.rating && (
                <Badge className="gap-1 bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-50">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    {plan.rating}
                </Badge>
              )}
              {plan.category && (
                <Badge variant="secondary" className="w-fit text-xs">
                  {plan.category}
                </Badge>
              )}
            </CardContent>
              {/* Acciones */}
              <CardFooter className="flex gap-2 pt-0">
                {/* Ver en mapa — navega a la vista del mapa y centra en este lugar */}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 text-xs cursor-pointer"
                  onClick={() => onViewInMap(plan)}
                >
                  <Map className="w-3.5 h-3.5" />
                  Ver en mapa
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-red-500 shrink-0 cursor-pointer"
                  onClick={() => onDelete(plan.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}