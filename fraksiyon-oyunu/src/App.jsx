import { useState } from 'react'
import { useGame } from './state/useGame.js'
import SetupScreen from './screens/SetupScreen.jsx'
import MapView from './screens/MapView.jsx'
import FactionPanel from './screens/FactionPanel.jsx'
import PlayScreen from './screens/PlayScreen.jsx'
import TurnLogScreen from './screens/TurnLogScreen.jsx'
import TurnSummaryModal from './screens/TurnSummaryModal.jsx'
import GameOverScreen from './screens/GameOverScreen.jsx'

const TABS = [
  { id: 'oyna', label: 'Oyna', icon: '🃏' },
  { id: 'harita', label: 'Harita', icon: '🗺️' },
  { id: 'panel', label: 'Panel', icon: '📊' },
  { id: 'gunluk', label: 'Günlük', icon: '📜' },
]

export default function App() {
  const { state, startGame, selectCard, setPlayerAction, endTurn, resetGame } = useGame()
  const [tab, setTab] = useState('oyna')
  const [dismissedTurn, setDismissedTurn] = useState(null)

  if (!state) {
    return <SetupScreen onStart={startGame} />
  }

  if (state.phase === 'game-over') {
    return <GameOverScreen state={state} onRestart={resetGame} />
  }

  const showSummary = Boolean(state.lastTurnLog) && dismissedTurn !== state.turn

  return (
    <div className="flex flex-col min-h-svh bg-slate-950">
      <div className="sticky top-0 z-10 bg-slate-950/95 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
        <div>
          <div className="text-white font-bold text-sm">KIRILMA</div>
          <div className="text-xs text-slate-500">Tur {state.turn}/{state.maxTurns}</div>
        </div>
        <div className="flex gap-3 text-xs text-slate-400">
          <span>Enf. %{state.global.inflation.toFixed(1)}</span>
          <span>İşs. %{(state.global.nationalUnemployment * 100).toFixed(1)}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {tab === 'oyna' && (
          <PlayScreen key={state.turn} state={state} selectCard={selectCard} setPlayerAction={setPlayerAction} endTurn={endTurn} />
        )}
        {tab === 'harita' && <MapView state={state} />}
        {tab === 'panel' && <FactionPanel state={state} />}
        {tab === 'gunluk' && <TurnLogScreen state={state} />}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-slate-950 border-t border-slate-800 flex z-20">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors ${
              tab === t.id ? 'text-blue-400' : 'text-slate-500'
            }`}
          >
            <span className="text-xl">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {showSummary && (
        <TurnSummaryModal
          entries={state.lastTurnLog}
          turn={state.turn - 1 >= 1 ? state.turn - 1 : state.turn}
          onClose={() => setDismissedTurn(state.turn)}
        />
      )}
    </div>
  )
}
