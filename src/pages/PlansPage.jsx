import { useState, useEffect, useCallback } from "react"
import { searchPlaces, savePlan } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, BookmarkPlus, Check } from "lucide-react"

const BOGOTA = { lat: 4.7110, lng: -74.0721 }

// Categorías fijas con emoji para el checkbox
const CATEGORIES = [
  { id: "hamburguesas",  label: "Hamburguesas",  emoji: "🍔" },
  { id: "pizzerias",     label: "Pizzerías",      emoji: "🍕" },
  { id: "trampolines",   label: "Trampolines",    emoji: "🤸" },
  { id: "escape_rooms",  label: "Escape Rooms",   emoji: "🔐" },
  { id: "bolos",         label: "Bolos",          emoji: "🎳" },
  { id: "futbol",        label: "Fútbol",         emoji: "⚽" },
  { id: "karts",         label: "Karts",          emoji: "🏎️" },
  { id: "paintball",     label: "Paintball",      emoji: "🎯" },
  { id: "restaurantes",  label: "Restaurantes",   emoji: "🍽️" },
]

// Card individual de un lugar sugerido
function PlaceCard({ place, onSave, savedPlaceNames }) {
  const [saving, setSaving]   = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const isSaved = savedPlaceNames.includes(place.name) || justSaved

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(place)
      setJustSaved(true)
    } catch {
      // error manejado arriba
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer">
      {place.photo ? (
        <img src={place.photo} alt={place.name}
          className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-slate-100 flex items-center justify-center text-4xl">
          📍
        </div>
      )}

      <CardContent className="flex flex-col gap-2 flex-1 pt-4">
        <p className="font-semibold text-slate-800 leading-tight">{place.name}</p>

        {place.address && (
          <p className="text-xs text-slate-500 leading-relaxed">{place.address}</p>
        )}

        {place.rating && (
          <Badge className="gap-1 bg-yellow-50 border-yellow-200 text-yellow-700
                            hover:bg-yellow-50 w-fit">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            {place.rating}
          </Badge>
        )}

        {/* Badge de categoría */}
        {place.category && (
          <Badge variant="secondary" className="w-fit text-xs">
            {CATEGORIES.find(c => c.id === place.category)?.emoji}{" "}
            {CATEGORIES.find(c => c.id === place.category)?.label}
          </Badge>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          size="sm"
          className={`w-full transition-colors ${
            isSaved ? "bg-emerald-500 hover:bg-emerald-500 cursor-default" : "cursor-pointer"
          }`}
          disabled={saving || isSaved}
          onClick={handleSave}
        >
          {saving ? (
            <span className="w-3 h-3 border-2 border-white border-t-transparent
                             rounded-full animate-spin" />
          ) : isSaved ? (
            <><Check className="w-3 h-3 mr-1" />Guardado</>
          ) : (
            <><BookmarkPlus className="w-3 h-3 mr-1" />Guardar en mi plan</>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

// Skeleton de una card mientras carga
function PlaceCardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
      <Skeleton className="w-full h-40" />
      <div className="p-4 flex flex-col gap-3">
        <Skeleton className="h-4 w-3/4 rounded-full" />
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-3 w-2/3 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-8 w-full rounded-lg mt-2" />
      </div>
    </div>
  )
}

export default function PlansPage({ user, plans, onSave, onDeletePlan, mapCenter }) {
  // Categorías activas — todas activas por defecto
  const [activeCategories, setActiveCategories] = useState(() => {
    try {
      const saved = localStorage.getItem("plannery_categories")
      return saved ? JSON.parse(saved) : CATEGORIES.map(c => c.id)
    } catch {
      return CATEGORIES.map(c => c.id)
    }
  })
  useEffect(() => {
    localStorage.setItem("plannery_categories", JSON.stringify(activeCategories))
  }, [activeCategories])

  // Resultados por categoría: { hamburguesas: [...], pizzerias: [...], ... }
  const [results, setResults]       = useState({})
  const [loading, setLoading]       = useState({})

  const savedPlaceNames = plans.map(p => p.name ?? p.nombre)

  // Busca los lugares de una categoría específica
  const fetchCategory = useCallback(async (categoryId) => {
    setLoading(prev => ({ ...prev, [categoryId]: true }))
    try {
      const data = await searchPlaces({
        query: categoryId.replace("_", " "),
        lat:   mapCenter?.lat ?? BOGOTA.lat,
        lng:   mapCenter?.lng ?? BOGOTA.lng,
      })
      // Agrega la categoría a cada lugar para mostrarlo en el badge
      const placesWithCategory = (data.places ?? []).map(p => ({
        ...p,
        category: categoryId,
      }))
      setResults(prev => ({ ...prev, [categoryId]: placesWithCategory }))
    } catch {
      setResults(prev => ({ ...prev, [categoryId]: [] }))
    } finally {
      setLoading(prev => ({ ...prev, [categoryId]: false }))
    }
  }, [mapCenter])

  // Al montar la vista busca todas las categorías activas por defecto
  useEffect(() => {
    CATEGORIES.forEach(cat => fetchCategory(cat.id))
  }, [fetchCategory])

  // Activa o desactiva una categoría
  function toggleCategory(categoryId) {
    setActiveCategories(prev => {
      const isActive = prev.includes(categoryId)
      if (isActive) {
        // Desactiva — quita del array
        return prev.filter(id => id !== categoryId)
      } else {
        // Activa — busca si no tiene resultados aún
        if (!results[categoryId]) fetchCategory(categoryId)
        return [...prev, categoryId]
      }
    })
  }

  // Todos los lugares de categorías activas aplanados en un array
  const allPlaces = activeCategories.flatMap(id => results[id] ?? [])

  // Si alguna categoría activa está cargando
  const anyLoading = activeCategories.some(id => loading[id])

  return (
    <div className="flex flex-1 overflow-hidden">

      {/* Sidebar de categorías */}
      <aside className="w-56 shrink-0 border-r border-slate-200 bg-white p-4
                        flex flex-col gap-3 overflow-y-auto">
        <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
          Categorías
        </h2>

        <div className="flex flex-col gap-1">
          {CATEGORIES.map(cat => {
            const isActive = activeCategories.includes(cat.id)
            const isLoading = loading[cat.id]

            return (
              <label
                key={cat.id}
                className="flex items-center gap-3 px-2 py-2 rounded-lg
                           hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => toggleCategory(cat.id)}
                  className="w-4 h-4 accent-slate-800 cursor-pointer"
                />
                <span className="text-sm text-slate-700 flex items-center gap-2">
                  {cat.emoji} {cat.label}
                </span>
                {/* Spinner por categoría mientras carga */}
                {isLoading && (
                  <span className="ml-auto w-3 h-3 border-2 border-slate-400
                                   border-t-transparent rounded-full animate-spin" />
                )}
              </label>
            )
          })}
        </div>
      </aside>

      {/* Área principal */}
      <div className="flex flex-col flex-1 overflow-hidden">

      

        {/* Cards de lugares */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Contador de resultados */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold text-slate-800">
              {anyLoading ? "Buscando lugares..." : `${allPlaces.length} lugares encontrados`}
            </h1>
          </div>

          {/* Grid de cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                          xl:grid-cols-4 gap-4">

            {/* Skeletons mientras carga */}
            {anyLoading && allPlaces.length === 0 &&
              [1,2,3,4,5,6,7,8].map(i => <PlaceCardSkeleton key={i} />)
            }

            {/* Cards reales */}
            {allPlaces.map((place, i) => (
              <PlaceCard
                key={`${place.category}-${i}`}
                place={place}
                onSave={onSave}
                savedPlaceNames={savedPlaceNames}
              />
            ))}

            {/* Estado vacío */}
            {!anyLoading && allPlaces.length === 0 && (
              <div className="col-span-full flex flex-col items-center
                              justify-center gap-3 py-20 text-slate-400">
                <p className="text-4xl">🔍</p>
                <p className="text-sm">No hay lugares para las categorías seleccionadas</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}