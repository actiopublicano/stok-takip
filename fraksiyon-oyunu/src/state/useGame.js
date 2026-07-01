import { useState, useCallback, useEffect } from 'react'
import { createInitialState } from '../engine/state.js'
import { resolveTurn } from '../engine/turn.js'

const STORAGE_KEY = 'kirilma-oyun-durumu-v1'

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function useGame() {
  const [state, setState] = useState(loadSavedState)

  useEffect(() => {
    try {
      if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // localStorage kullanılamıyorsa (gizli sekme vb.) sessizce yok say
    }
  }, [state])

  const startGame = useCallback((config) => {
    setState(createInitialState(config))
  }, [])

  const selectCard = useCallback((cardId) => {
    setState((s) => {
      const next = structuredClone(s)
      next.factions[s.playerFactionId].selectedCardId = cardId
      return next
    })
  }, [])

  const setPlayerAction = useCallback((pendingAction) => {
    setState((s) => {
      const next = structuredClone(s)
      next.factions[s.playerFactionId].pendingAction = pendingAction
      return next
    })
  }, [])

  const endTurn = useCallback(() => {
    setState((s) => resolveTurn(s))
  }, [])

  const resetGame = useCallback(() => {
    setState(null)
  }, [])

  return { state, startGame, selectCard, setPlayerAction, endTurn, resetGame }
}
