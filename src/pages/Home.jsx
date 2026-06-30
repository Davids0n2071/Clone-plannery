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
import PlansPage from "@/pages/PlansPage"
import ChatPanel from "@/components/chat/ChatPanel"
import { MessageCircle, PanelLeft, X } from "lucide-react"
import CategoryFilter from "@/components/map/CategoryFilter"

const BOGOTA = { lat: 4.7110, lng: -74.0721 }

function MapContent({
  places, onSearch, searching, onSave, savedPlaceNames,
  plans, onDeletePlan, focusedPlan, onFocusHandled,
  markerFilter, onFilterChange, onClearSearch,
  searchQuery, onSearchQueryChange,
  mapCategories, categoryResults, categoryLoading, onCategoryChange,
}) {
  const map = useMap()
  const hasResults = places.length > 0

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

  const categoryPlaces = mapCategories.flatMap(id => categoryResults[id] ?? [])

  return (
    <>
      <SearchBar
        value={searchQuery}
        onChange={onSearchQueryChange}
        onSearch={handleSearch}
        loading={searching}
      />
      {/* Filtro de categorías — siempre visible en el mapa */}
      <CategoryFilter
        activeCategories={mapCategories}
        onChange={onCategoryChange}
        loading={categoryLoading}
      />
      {hasResults && (
        <MarkerFilter
          showPlans={markerFilter.showPlans}
          showResults={markerFilter.showResults}
          onChange={onFilterChange}
          onClear={onClearSearch}
        />
      )}

      {markerFilter.showPlans && plans.map(plan => (
        <PlanMarker
          key={`plan-${plan.id}`}
          plan={plan}
          onDelete={onDeletePlan}
          openOnMount={focusedPlan?.id === plan.id}
        />
      ))}
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
      {/* Marcadores azules — resultados de categorías */}
      {categoryPlaces
        .filter(place => !savedNames.has(place.name))
        .map((place, i) => (
          <PlaceMarker
            key={`cat-${place.category}-${i}`}
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
  const [activeView, setActiveView]     = useState("planes")  // ← "planes" es la vista principal
  const [chatOpen, setChatOpen]         = useState(false)
  const [focusedPlan, setFocusedPlan]   = useState(null)
  const [searchQuery, setSearchQuery]   = useState("")
  const [mapCategories, setMapCategories] = useState(() => {
    try {
      const saved = localStorage.getItem("plannery_map_categories")
      return saved ? JSON.parse(saved) : []  // ← vacío por defecto en el mapa
    } catch {
      return []
    }
  })
  const [categoryResults, setCategoryResults] = useState({})
  const [categoryLoading, setCategoryLoading] = useState({})
  const [plansOpen, setPlansOpen]       = useState(true)
  const [mapCenter, setMapCenter]       = useState(BOGOTA)
  const [markerFilter, setMarkerFilter] = useState({
    showPlans:   true,
    showResults: true,
  })

  const savedPlaceNames = plans.map(p => p.name ?? p.nombre)

  useEffect(() => {
    localStorage.setItem("plannery_map_categories", JSON.stringify(mapCategories))
  }, [mapCategories])

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

  async function handleMapCategory(categoryId) {
    const isActive = mapCategories.includes(categoryId)
  
    if (isActive) {
      // Desactiva — quita del array y limpia resultados
      setMapCategories(prev => prev.filter(id => id !== categoryId))
      setCategoryResults(prev => {
        const next = { ...prev }
        delete next[categoryId]
        return next
      })
      return
    }
  
    // Activa — busca lugares de esa categoría
    setMapCategories(prev => [...prev, categoryId])
    setCategoryLoading(prev => ({ ...prev, [categoryId]: true }))
  
    try {
      const data = await searchPlaces({
        query: categoryId.replace("_", " "),
        lat:   BOGOTA.lat,
        lng:   BOGOTA.lng,
      })
      setCategoryResults(prev => ({
        ...prev,
        [categoryId]: (data.places ?? []).map(p => ({ ...p, category: categoryId }))
      }))
    } catch {
      setCategoryResults(prev => ({ ...prev, [categoryId]: [] }))
    } finally {
      setCategoryLoading(prev => ({ ...prev, [categoryId]: false }))
    }
  }
  
  async function handleSearch(query, lat, lng) {
    setSearching(true)
    setError(null)
    try {
      const data = await searchPlaces({ query, lat, lng })
      setPlaces(data.places ?? [])
      setMarkerFilter({ showPlans: true, showResults: true })
      return data.places
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setSearching(false)
    }
  }

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
    setActiveView("mapa")
  }

  function navBtnClass(view) {
    const isActive = activeView === view
    return `px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
      isActive
        ? "bg-slate-100 text-slate-900"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
    }`
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">

      {/* Navbar */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">

        <div className="flex items-center gap-1">
          {/* Botón panel — solo visible en la vista del mapa */}
          {activeView === "mapa" && (
            <button
              onClick={() => setPlansOpen(prev => !prev)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {plansOpen
                ? <X className="w-5 h-5 text-slate-600" />
                : <PanelLeft className="w-5 h-5 text-slate-600" />
              }
            </button>
          )}
          <span className="text-xl font-bold text-slate-800">📍 Plannery</span>
        </div>

        <nav className="flex gap-1">
          {/* Planes — vista principal con categorías */}
          <button
            onClick={() => setActiveView("planes")}
            className={navBtnClass("planes")}
          >
            Planes
          </button>

          {/* Mapa */}
          <button
            onClick={() => setActiveView("mapa")}
            className={navBtnClass("mapa")}
          >
            Mapa
          </button>

          {/* Mis planes */}
          <button
            onClick={() => setActiveView("misplanes")}
            className={navBtnClass("misplanes")}
          >
            Mis planes
          </button>

          {/* Chat IA */}
          <button
            onClick={() => setChatOpen(prev => !prev)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        flex items-center gap-2 cursor-pointer ${
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
              className="w-8 h-8 rounded-full border border-slate-200 cursor-pointer" />
          )}
          <span className="text-sm text-slate-600 hidden sm:block">
            {user?.displayName}
          </span>
          <Button variant="outline" size="sm" className="cursor-pointer"
            onClick={() => logout()}>
            Cerrar sesión
          </Button>
        </div>
      </header>

      {/* ── VISTA PLANES — categorías + cards ── */}
      {activeView === "planes" && (
        <PlansPage
          user={user}
          plans={plans}
          onSave={handleSave}
          onDeletePlan={handleDelete}
          mapCenter={mapCenter}
        />
      )}

      {/* ── VISTA MAPA ── */}
      {activeView === "mapa" && (
        <main className="flex flex-1 overflow-hidden">

          {/* Panel deslizante de planes guardados */}
          <div className={`shrink-0 bg-white border-r border-slate-200 shadow-xl
                          flex flex-col gap-3 overflow-hidden
                          transition-all duration-300 ease-in-out
                          ${plansOpen ? "w-80 p-4" : "w-0 p-0"}`}>
            {plansOpen && (
              <>
                <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide shrink-0">
                  Planes guardados
                </h2>
                <PlansList
                  plans={plans}
                  loading={plansLoading}
                  onDelete={handleDelete}
                />
              </>
            )}
          </div>

          {/* Mapa */}
          <section className="flex-1 relative">

            {searching && (
              <div className="absolute inset-0 z-10 flex items-center justify-center
                              bg-white/30 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-lg px-6 py-4
                                flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-slate-800
                                  border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-slate-700 font-medium">
                    Buscando lugares...
                  </span>
                </div>
              </div>
            )}

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
              fullscreenControl={false}
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
                  mapCategories={mapCategories}
                  categoryResults={categoryResults}
                  categoryLoading={categoryLoading}
                  onCategoryChange={handleMapCategory}
              />
            </Map>
          </section>

        </main>
      )}

      {/* ── VISTA MIS PLANES ── */}
      {activeView === "misplanes" && (
        <div className="flex flex-1 overflow-hidden">
          <PlansView
            plans={plans}
            loading={plansLoading}
            onDelete={handleDelete}
            onViewInMap={handleViewInMap}
          />
        </div>
      )}

      {/* Botón flotante del chat */}
      <button
        onClick={() => setChatOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
                   bg-slate-800 text-white shadow-lg hover:bg-slate-700
                   transition-all flex items-center justify-center cursor-pointer"
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