// src/hooks/useAuth.js
// Hook reutilizable que devuelve el usuario actual y si está cargando.
// React llama a onAuthStateChanged y actualiza el estado automáticamente
// cada vez que el usuario inicia o cierra sesión.

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

export function useAuth() {
  const [user, setUser]       = useState(null)   // usuario actual o null
  const [loading, setLoading] = useState(true)   // true mientras Firebase verifica

  useEffect(() => {
    // Firebase llama a este callback cuando cambia el estado de sesión
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    // Al desmontar el componente, cancelamos la suscripción
    return () => unsubscribe()
  }, [])

  return { user, loading }
}