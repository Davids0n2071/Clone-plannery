import { useState, useEffect, useRef } from "react"
import { AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from "@vis.gl/react-google-maps"
import { Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function GreenPin({ onMouseEnter, onMouseLeave }) {
  return (
    <div
      style={{ transform: "translate(-50%, -100%)", cursor: "pointer" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
        <path
          d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24S32 26 32 16C32 7.163 24.837 0 16 0z"
          fill="#10b981"
        />
        <circle cx="16" cy="16" r="7" fill="white" opacity="0.9" />
      </svg>
    </div>
  )
}

export default function PlanMarker({ plan, onDelete, openOnMount = false }) {
  const [open, setOpen]         = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [markerRef, marker]     = useAdvancedMarkerRef()
  const closeTimer              = useRef(null)

  useEffect(() => {
    if (openOnMount && marker) {
      setTimeout(() => setOpen(true), 300)
    }
  }, [openOnMount, marker])

  function handleMouseEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }

  function handleMouseLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 300)
  }

  function handlePopupEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  function handlePopupLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 300)
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await onDelete(plan.id)
    } catch {
      setDeleting(false)
    }
  }

  const lat = plan.latitude  ?? plan.lat
  const lng = plan.longitude ?? plan.lng
  if (!lat || !lng) return null

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat, lng }}
        title={plan.name ?? plan.nombre}
      >
        <GreenPin
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </AdvancedMarker>

      {open && (
        <InfoWindow
          anchor={marker}
          onCloseClick={() => setOpen(false)}
          maxWidth={260}
        >
          <div
            className="flex flex-col gap-2 p-1"
            onMouseEnter={handlePopupEnter}
            onMouseLeave={handlePopupLeave}
          >
            {(plan.photo_url || plan.photo) && (
              <img
                src={plan.photo_url ?? plan.photo}
                alt={plan.name ?? plan.nombre}
                className="w-full h-32 object-cover rounded-lg"
              />
            )}

            <p className="font-semibold text-slate-800 text-sm leading-tight">
              {plan.name ?? plan.nombre}
            </p>

            {(plan.address ?? plan.direccion) && (
              <p className="text-xs text-slate-500 leading-tight">
                {plan.address ?? plan.direccion}
              </p>
            )}

            {plan.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium text-slate-700">
                  {plan.rating}
                </span>
              </div>
            )}
            {(plan.category) && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full w-fit">
                {plan.category}
              </span>
            )}

            <Button
              size="sm"
              variant="destructive"
              className="w-full mt-1 cursor-pointer"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Trash2 className="w-3 h-3 mr-1" />Eliminar de mis planes</>
              )}
            </Button>
          </div>
        </InfoWindow>
      )}
    </>
  )
}