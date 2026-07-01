import { FACTIONS, FACTION_IDS } from '../data/factions.js'
import { ProgressBar, Badge, SectionTitle } from '../components/ui.jsx'

function ResourceRow({ label, value }) {
  return (
    <div className="flex justify-between text-xs text-slate-300">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  )
}

export default function FactionPanel({ state }) {
  const { global } = state

  return (
    <div className="p-4 pb-24 space-y-4">
      <div>
        <SectionTitle>Küresel Göstergeler</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
            <div className="text-xs text-slate-500">Enflasyon</div>
            <div className="text-xl font-bold text-white">%{global.inflation.toFixed(1)}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
            <div className="text-xs text-slate-500">Ulusal İşsizlik</div>
            <div className="text-xl font-bold text-white">%{(global.nationalUnemployment * 100).toFixed(1)}</div>
          </div>
        </div>
        {global.crisisActive && (
          <div className="mt-2">
            <Badge tone="red">⚠ Ulusal Kriz Aktif</Badge>
          </div>
        )}
      </div>

      <div>
        <SectionTitle>Fraksiyonlar</SectionTitle>
        <div className="space-y-3">
          {FACTION_IDS.map((id) => {
            const meta = FACTIONS[id]
            const f = state.factions[id]
            const isPlayer = id === state.playerFactionId
            return (
              <div key={id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{meta.icon}</span>
                    <span className="font-semibold text-white text-sm">{meta.name}</span>
                    {isPlayer && <Badge tone="blue">Sen</Badge>}
                    {!isPlayer && <Badge>{f.personality}</Badge>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2">
                  <ResourceRow label="👷 İşgücü" value={Math.round(f.resources.labor)} />
                  <ResourceRow label="⚙️ Üretim" value={Math.round(f.resources.production)} />
                  <ResourceRow label="💰 Sermaye" value={Math.round(f.resources.capital)} />
                  <ResourceRow label="🏛️ Nüfuz" value={Math.round(f.resources.influence)} />
                </div>
                <div className="text-xs text-slate-500 mb-1">Kazanma İlerlemesi</div>
                <ProgressBar value={f.powerIndex} color={meta.color} />
                <div className="text-xs text-slate-500 mt-1">{meta.winConditionText}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
