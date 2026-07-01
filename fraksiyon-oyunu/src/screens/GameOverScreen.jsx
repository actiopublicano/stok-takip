import { FACTIONS, FACTION_IDS } from '../data/factions.js'
import { Button, ProgressBar } from '../components/ui.jsx'

export default function GameOverScreen({ state, onRestart }) {
  const winner = FACTIONS[state.winner]
  const sorted = [...FACTION_IDS].sort((a, b) => (state.factions[b].powerIndex || 0) - (state.factions[a].powerIndex || 0))

  return (
    <div className="p-4 pb-28 space-y-5 pt-8 text-center">
      <div className="text-5xl">{winner.icon}</div>
      <h1 className="text-2xl font-bold text-white">{winner.name} Kazandı</h1>
      <p className="text-slate-400 text-sm">{state.winnerReason}</p>
      <p className="text-slate-500 text-xs">{state.turn}. turda sona erdi</p>

      <div className="text-left mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-2">Final Güç Endeksleri</h2>
        <div className="space-y-3">
          {sorted.map((id) => {
            const meta = FACTIONS[id]
            const f = state.factions[id]
            return (
              <div key={id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-white font-medium">
                    {meta.icon} {meta.name}
                  </span>
                  <span className="text-sm text-slate-400">{f.powerIndex}</span>
                </div>
                <ProgressBar value={f.powerIndex} color={meta.color} />
              </div>
            )
          })}
        </div>
      </div>

      <Button className="w-full mt-6" onClick={onRestart}>
        Yeniden Oyna
      </Button>
    </div>
  )
}
