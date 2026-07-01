import { useState } from 'react'
import { FACTIONS, FACTION_IDS } from '../data/factions.js'
import { PERSONALITIES } from '../ai/personalities.js'
import { Button, Card } from '../components/ui.jsx'

const PERSONALITY_KEYS = Object.keys(PERSONALITIES)

function randomPersonality() {
  return PERSONALITY_KEYS[Math.floor(Math.random() * PERSONALITY_KEYS.length)]
}

export default function SetupScreen({ onStart }) {
  const [playerFactionId, setPlayerFactionId] = useState('halk')
  const [aiPersonalities, setAiPersonalities] = useState(() => {
    const initial = {}
    for (const id of FACTION_IDS) initial[id] = randomPersonality()
    return initial
  })

  const opponents = FACTION_IDS.filter((id) => id !== playerFactionId)

  return (
    <div className="p-4 pb-28 space-y-5">
      <div className="text-center pt-4 pb-2">
        <h1 className="text-2xl font-bold text-white">KIRILMA</h1>
        <p className="text-slate-400 text-sm mt-1">Asimetrik ekonomi ve politika stratejisi</p>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-2">Fraksiyonunu Seç</h2>
        <div className="space-y-2">
          {FACTION_IDS.map((id) => {
            const f = FACTIONS[id]
            return (
              <Card key={id} selected={playerFactionId === id} onClick={() => setPlayerFactionId(id)}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{f.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{f.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{f.tagline}</div>
                    <div className="text-xs text-slate-500 mt-1">🏆 {f.winConditionText}</div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-2">Rakip Yapay Zekalar</h2>
        <div className="space-y-2">
          {opponents.map((id) => {
            const f = FACTIONS[id]
            return (
              <Card key={id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{f.icon}</span>
                  <span className="font-medium text-white text-sm">{f.name}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {PERSONALITY_KEYS.map((key) => (
                    <button
                      key={key}
                      onClick={() => setAiPersonalities((prev) => ({ ...prev, [id]: key }))}
                      className={`text-xs px-2.5 py-1 rounded-full border ${
                        aiPersonalities[id] === key
                          ? 'border-blue-500 bg-blue-950/60 text-blue-300'
                          : 'border-slate-700 text-slate-400'
                      }`}
                    >
                      {PERSONALITIES[key].label}
                    </button>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto p-4 bg-slate-950/95 border-t border-slate-800">
        <Button className="w-full" onClick={() => onStart({ playerFactionId, aiPersonalities })}>
          Oyunu Başlat
        </Button>
      </div>
    </div>
  )
}
