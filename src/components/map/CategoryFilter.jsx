// src/components/map/CategoryFilter.jsx
// Barra de categorías flotante sobre el mapa, debajo de la barra de búsqueda.
// Funciona igual que el sidebar de PlansPage pero en formato horizontal.

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
  
  export { CATEGORIES }
  
  export default function CategoryFilter({ activeCategories, onChange, loading }) {
    return (
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10
                      bg-white rounded-xl shadow-lg border border-slate-100
                      px-3 py-2 flex items-center gap-2 overflow-x-auto
                      max-w-[90%] scrollbar-hide">
        {CATEGORIES.map(cat => {
          const isActive  = activeCategories.includes(cat.id)
          const isLoading = loading[cat.id]
  
          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                          text-xs font-medium whitespace-nowrap transition-colors
                          cursor-pointer shrink-0 ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.emoji} {cat.label}
              {isLoading && (
                <span className="w-3 h-3 border-2 border-current
                                 border-t-transparent rounded-full animate-spin ml-1" />
              )}
            </button>
          )
        })}
      </div>
    )
  }