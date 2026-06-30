// src/lib/auth.js
// Funciones para iniciar sesión con Google y cerrar sesión.
// signInWithPopup abre una ventana emergente de Google.

import { signInWithPopup, signOut } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error("Error al iniciar sesión:", error.message)
    throw error
  }
}

export async function logout() {
  try {
    // Borra el historial del chat del localStorage antes de cerrar sesión
    const user = auth.currentUser
    if (user) {
      localStorage.removeItem(`chat_${user.uid}`)
    }
    await signOut(auth)
  } catch (error) {
    console.error("Error al cerrar sesión:", error.message)
    throw error
  }
}