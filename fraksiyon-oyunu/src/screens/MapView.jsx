import { useState } from 'react'
import { FACTIONS } from '../data/factions.js'
import { REGION_TYPE_LABEL } from '../data/regionsData.js'
import { Badge } from '../components/ui.jsx'

const NEUTRAL_COLOR = '#475569'

export default function MapView({ state }) {
  const [selectedId, setSelectedId] = useState(null)
  const selected = state.regions.find((r) => r.id === selectedId)

  return (
    <div className="p-4 pb-24">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-2">Anakara Haritası</h2>
      <div className="relative w-full aspect-[4/5] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full">
          {state.regions.flatMap((r) =>
            r.connections
              .filter((c) => c > r.id)
              .map((c) => {
                const target = state.regions.find((x) => x.id === c)
                if (!target) return null
                return (
                  <line
                    key={`${r.id}-${c}`}
                    x1={`${r.x}%`}
                    y1={`${r.y}%`}
                    x2={`${target.x}%`}
                    y2={`${target.y}%`}
                    stroke="#334155"
                    strokeWidth="1.5"
                  />
                )
              }),
          )}
        </svg>
        {state.regions.map((r) => {
          const color = r.dominantFaction ? FACTIONS[r.dominantFaction].color : NEUTRAL_COLOR
          const size = 16 + (r.population / 100) * 20
          return (
            <button
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              className="absolute flex items-center justify-center rounded-full border-2 border-slate-950 shadow-lg"
              style={{
                left: `${r.x}%`,
                top: `${r.y}%`,
                width: size,
                height: size,
                background: color,
                transform: 'translate(-50%, -50%)',
              }}
              aria-label={r.name}
            />
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {Object.values(FACTIONS).map((f) => (
          <div key={f.id} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: f.color }} />
            {f.shortName}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: NEUTRAL_COLOR }} />
          Tarafsız
        </div>
      </div>

      {selected && (
        <div className="mt-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">{selected.name}</h3>
            <Badge tone="blue">{REGION_TYPE_LABEL[selected.type]}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
            <div>Nüfus: <span className="text-white">{selected.population}</span></div>
            <div>Üretim Kapasitesi: <span className="text-white">{selected.prodCapacity.toFixed(1)}</span></div>
            <div>İşsizlik: <span className="text-white">%{Math.round(selected.unemployment * 100)}</span></div>
            <div>Üretim: <span className="text-white">{(selected.production || 0).toFixed(1)}</span></div>
          </div>
          {selected.dominantFaction && (
            <div className="mt-2 text-xs text-slate-400">
              Baskın etki: <span className="text-white">{FACTIONS[selected.dominantFaction].name}</span>
            </div>
          )}
          {selected.strikeActive && <div className="mt-2"><Badge tone="red">Grev sürüyor</Badge></div>}
        </div>
      )}
    </div>
  )
}
