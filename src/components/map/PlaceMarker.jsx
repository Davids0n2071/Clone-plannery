import { useState } from "react"
import { AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from "@vis.gl/react-google-maps"
import { Button } from "@/components/ui/button"
import { Star, BookmarkPlus, Check } from "lucide-react"

// Pin SVG personalizado — cambia de color según si está guardado
function MapPin({ saved }) {
  const color = saved ? "#10b981" : "#ef4444" // emerald-500 o red-500
  return (
    <div style={{ transform: "translate(-50%, -100%)", cursor: "pointer" }}>
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
        <path
          d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24S32 26 32 16C32 7.163 24.837 0 16 0z"
          fill={color}
        />
        <circle cx="16" cy="16" r="7" fill="white" opacity="0.9" />
      </svg>
    </div>
  )
}

export default function PlaceMarker({ place, onSave, savedPlaceNames = [] }) {
  const [open, setOpen]       = useState(false)
  const [saving, setSaving]   = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [markerRef, marker]   = useAdvancedMarkerRef()

  const alreadySaved = savedPlaceNames.includes(place.name)
  const isSaved      = alreadySaved || justSaved

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(place)
      setJustSaved(true)
    } catch {
      // error manejado en Home.jsx
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: place.lat, lng: place.lng }}
        onClick={() => setOpen(true)}
        title={place.name}
      >
        {/* El pin cambia de color reactivamente con isSaved */}
        <MapPin saved={isSaved} />
      </AdvancedMarker>

      {open && (
        <InfoWindow anchor={marker} onCloseClick={() => setOpen(false)} maxWidth={260}>
          <div className="flex flex-col gap-2 p-1">

            {place.photo && (
              <img src={place.photo} alt={place.name}
                className="w-full h-32 object-cover rounded-lg" />
            )}

            <p className="font-semibold text-slate-800 text-sm leading-tight">
              {place.name}
            </p>

            {place.address && (
              <p className="text-xs text-slate-500 leading-tight">{place.address}</p>
            )}

            {place.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium text-slate-700">{place.rating}</span>
              </div>
            )}

            <Button
              size="sm"
              className={`w-full mt-1 transition-colors ${
                isSaved ? "bg-emerald-500 hover:bg-emerald-500 text-white cursor-default" : ""
              }`}
              disabled={saving || isSaved}
              onClick={handleSave}
            >
              {saving ? (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isSaved ? (
                <><Check className="w-3 h-3 mr-1" />Ya guardado</>
              ) : (
                <><BookmarkPlus className="w-3 h-3 mr-1" />Guardar en mi plan</>
              )}
            </Button>

          </div>
        </InfoWindow>
      )}
    </>
  )
}