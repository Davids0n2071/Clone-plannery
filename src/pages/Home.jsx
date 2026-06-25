import { useState, useCallback, useEffect } from "react"
import { Map, useMap } from "@vis.gl/react-google-maps"
import { logout } from "@/lib/auth"
import { searchPlaces, savePlan, getPlans, deletePlan } from "@/lib/api"
import { Button } from "@/components/ui/button"
import SearchBar from "@/components/map/SearchBar"
import MarkerFilter from "@/components/map/MarkerFilter"
import PlaceMarker from "@/components/map/PlaceMarker"
import PlanMarker from "@/components/map/PlanMarker"
import PlansList from "@/components/plans/PlansList"
import PlansView from "@/components/plans/PlansView"
import ChatPanel from "@/components/chat/ChatPanel"
import { MessageCircle } from "lucide-react"

const BOGOTA = { lat: 4.7110, lng: -74.0721 }

function MapContent({
  places, onSearch, searching, onSave, savedPlaceNames,
  plans, onDeletePlan, focusedPlan, onFocusHandled,
  markerFilter, onFilterChange, onClearSearch,
  searchQuery, onSearchQueryChange,
}) {
  const map = useMap()
  const hasResults = places.length > 0

  // Centra el mapa en el plan seleccionado desde "Ver en mapa"
  useEffect(() => {
    if (!map || !focusedPlan) return
    const lat = focusedPlan.latitude ?? focusedPlan.lat
    const lng = focusedPlan.longitude ?? focusedPlan.lng
    if (!lat || !lng) return
    map.panTo({ lat, lng })
    map.setZoom(17)
  }, [map, focusedPlan])

  const fitBounds = useCallback((results) => {
    if (!map || results.length === 0) return
    const bounds = new window.google.maps.LatLngBounds()
    results.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }))
    map.fitBounds(bounds, 80)
  }, [map])

  async function handleSearch(query) {
    const center = map?.getCenter()
    const lat = center?.lat() ?? BOGOTA.lat
    const lng = center?.lng() ?? BOGOTA.lng
    const results = await onSearch(query, lat, lng)
    if (results) fitBounds(results)
  }

  const savedNames = new Set(savedPlaceNames)

  return (
    <>
      {/* Barra de búsqueda — ahora controlada */}
      <SearchBar
        value={searchQuery}
        onChange={onSearchQueryChange}
        onSearch={handleSearch}
        loading={searching}
      />

      {/* Filtros — solo visibles cuando hay resultados de búsqueda */}
      {hasResults && (
        <MarkerFilter
          showPlans={markerFilter.showPlans}
          showResults={markerFilter.showResults}
          onChange={onFilterChange}
          onClear={onClearSearch}
        />
      )}

      {/* Marcadores verdes — planes guardados */}
      {markerFilter.showPlans && plans.map(plan => (
        <PlanMarker
          key={`plan-${plan.id}`}
          plan={plan}
          onDelete={onDeletePlan}
          openOnMount={focusedPlan?.id === plan.id}
        />
      ))}

      {/* Marcadores rojos — resultados de búsqueda no guardados */}
      {markerFilter.showResults && places
        .filter(place => !savedNames.has(place.name))
        .map(place => (
          <PlaceMarker
            key={`search-${place.id}`}
            place={place}
            onSave={onSave}
            savedPlaceNames={savedPlaceNames}
          />
        ))
      }
    </>
  )
}

export default function Home({ user }) {
  const [places, setPlaces]             = useState([])
  const [searching, setSearching]       = useState(false)
  const [plans, setPlans]               = useState([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [error, setError]               = useState(null)
  const [activeView, setActiveView]     = useState("map")
  const [chatOpen, setChatOpen]         = useState(false)
  const [focusedPlan, setFocusedPlan]   = useState(null)
  const [searchQuery, setSearchQuery]   = useState("")

  // Estado por defecto: ambos tipos de marcadores visibles
  const [markerFilter, setMarkerFilter] = useState({
    showPlans:   true,
    showResults: true,
  })

  const savedPlaceNames = plans.map(p => p.name ?? p.nombre)

  useEffect(() => {
    async function loadPlans() {
      try {
        const data = await getPlans(user.uid)
        setPlans(Array.isArray(data) ? data : [])
      } catch {
        setPlans([])
      } finally {
        setPlansLoading(false)
      }
    }
    loadPlans()
  }, [user.uid])

  async function handleSearch(query, lat, lng) {
    setSearching(true)
    setError(null)
    try {
      const data = await searchPlaces({ query, lat, lng })
      setPlaces(data.places ?? [])
      // Al hacer nueva búsqueda resetea filtros a "Ver todos"
      setMarkerFilter({ showPlans: true, showResults: true })
      return data.places
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setSearching(false)
    }
  }

  // Limpia resultados de búsqueda, input y oculta los toggles
  function handleClearSearch() {
    setPlaces([])
    setSearchQuery("")
    setMarkerFilter({ showPlans: true, showResults: true })
  }

  async function handleSave(place) {
    try {
      const newPlan = await savePlan({ userId: user.uid, place })
      setPlans(prev => [newPlan, ...prev])
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  async function handleDelete(planId) {
    try {
      await deletePlan(planId)
      setPlans(prev => prev.filter(p => p.id !== planId))
    } catch (err) {
      setError(err.message)
    }
  }

  function handleViewInMap(plan) {
    setFocusedPlan(plan)
    setActiveView("map")
  }

  function navBtnClass(view) {
    const isActive = activeView === view
    return `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-slate-100 text-slate-900"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
    }`
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">

      {/* Navbar */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
        <span className="text-xl font-bold text-slate-800">📍 Plannery</span>

        <nav className="flex gap-1">
          <button onClick={() => setActiveView("map")} className={navBtnClass("map")}>
            Mapa
          </button>
          <button onClick={() => setActiveView("plans")} className={navBtnClass("plans")}>
            Mis planes
          </button>
          <button
            onClick={() => setChatOpen(prev => !prev)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        flex items-center gap-2 ${
              chatOpen
                ? "bg-slate-800 text-white"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Chat IA
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {user?.photoURL && (
            <img src={user.photoURL} alt="avatar"
              className="w-8 h-8 rounded-full border border-slate-200" />
          )}
          <span className="text-sm text-slate-600 hidden sm:block">
            {user?.displayName}
          </span>
          <Button variant="outline" size="sm" onClick={() => logout()}>
            Cerrar sesión
          </Button>
        </div>
      </header>

      {/* Vista mapa */}
      {activeView === "map" && (
        <main className="flex flex-1 overflow-hidden">

          <aside className="w-80 shrink-0 border-r border-slate-200 bg-slate-50
                            p-4 flex flex-col gap-3 overflow-hidden">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide shrink-0">
              Planes guardados
            </h2>
            <PlansList
              plans={plans}
              loading={plansLoading}
              onDelete={handleDelete}
            />
            <Button variant="outline" className="w-full shrink-0">+ Nuevo plan</Button>
          </aside>

          <section className="flex-1 relative">
            {error && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10
                              bg-red-50 border border-red-200 text-red-600
                              text-xs rounded-lg px-4 py-2 shadow">
                {error}
              </div>
            )}
            <Map
              defaultCenter={BOGOTA}
              defaultZoom={12}
              gestureHandling="greedy"
              mapId="plannery-map"
              style={{ width: "100%", height: "100%" }}
            >
              <MapContent
                places={places}
                onSearch={handleSearch}
                searching={searching}
                onSave={handleSave}
                savedPlaceNames={savedPlaceNames}
                plans={plans}
                onDeletePlan={handleDelete}
                focusedPlan={focusedPlan}
                onFocusHandled={() => setFocusedPlan(null)}
                markerFilter={markerFilter}
                onFilterChange={setMarkerFilter}
                onClearSearch={handleClearSearch}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
              />
            </Map>
          </section>

        </main>
      )}

      {/* Vista mis planes */}
      {activeView === "plans" && (
        <div className="flex flex-1 overflow-hidden">
          <PlansView
            plans={plans}
            loading={plansLoading}
            onDelete={handleDelete}
            onViewInMap={handleViewInMap}
          />
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => setChatOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
                   bg-slate-800 text-white shadow-lg hover:bg-slate-700
                   transition-all flex items-center justify-center"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      <ChatPanel
        user={user}
        plans={plans}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      />

    </div>
  )
}