'use client'

import { useEffect, useState } from 'react'

/**
 * Renvoie l'heure courante, rafraîchie périodiquement, pour que l'UI
 * (ex. verrouillage de confirmation à l'heure de début) bascule sans reload.
 * @param intervalMs intervalle de rafraîchissement (défaut 30 s)
 */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}
