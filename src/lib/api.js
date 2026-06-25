const BASE_URL = "http://localhost:8000"

export async function searchPlaces({ query, lat, lng }) {
  const response = await fetch(`${BASE_URL}/places/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, latitude: lat, longitude: lng }),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail ?? "Error al buscar lugares")
  }
  const raw = await response.json()
  const list = Array.isArray(raw) ? raw : raw.places ?? []
  return {
    places: list.map((p, index) => ({
      id:      p.id ?? `place-${index}`,
      name:    p.name,
      address: p.address,
      rating:  p.rating,
      photo:   p.photo_url ?? p.photo,
      lat:     p.latitude  ?? p.lat,
      lng:     p.longitude ?? p.lng,
    }))
  }
}

export async function savePlan({ userId, place }) {
  const response = await fetch(`${BASE_URL}/plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      name:      place.name,
      address:   place.address,
      latitude:  place.lat,
      longitude: place.lng,
      rating:    place.rating,
      photo_url: place.photo ?? null,
    }),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail ?? "Error al guardar el plan")
  }
  return response.json()
}

export async function getPlans(userId) {
  const response = await fetch(`${BASE_URL}/plans/${userId}`)
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail ?? "Error al obtener los planes")
  }
  return response.json()
}

export async function deletePlan(planId) {
  const response = await fetch(`${BASE_URL}/plans/${planId}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail ?? "Error al eliminar el plan")
  }
  return response.json()
}

// Envía un mensaje al chat de IA
export async function sendChatMessage({ userId, message, plans }) {
    const response = await fetch(`${BASE_URL}/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mensaje: message,           // ← era message
        userId,
        planes: plans.map(p => ({
          nombre:    p.name    ?? p.nombre,     // acepta ambos formatos
          direccion: p.address ?? p.direccion,
          rating:    p.rating,
        })),
      }),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail ?? "Error al enviar el mensaje")
    }
    return response.json()
  }