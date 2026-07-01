import { useEffect, useState } from 'react'
import { getCardById } from '../data/policyCards.js'
import { FACTION_ACTIONS, ACTION_BUDGET } from '../engine/factionRules.js'
import { FACTIONS } from '../data/factions.js'
import { Button, Card, Badge, SectionTitle } from '../components/ui.jsx'

function PolicyHand({ state, selectCard }) {
  const faction = state.factions[state.playerFactionId]
  const cards = faction.hand.map((id) => getCardById(id)).filter(Boolean)

  return (
    <div>
      <SectionTitle subtitle="Bu tur oynayacağın 1 kartı seç">Politika Kartların</SectionTitle>
      <div className="space-y-2">
        {cards.map((card) => (
          <Card key={card.id} selected={faction.selectedCardId === card.id} onClick={() => selectCard(card.id)}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-white text-sm">{card.name}</div>
                <div className="text-xs text-slate-400 mt-1">{card.description}</div>
              </div>
              {card.pool !== 'common' && <Badge tone="blue">Özel</Badge>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function RegionSelect({ regions, value, onChange, placeholder = 'Bölge seç' }) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-800 text-white text-sm rounded-lg px-2 py-1.5 border border-slate-700"
    >
      <option value="">{placeholder}</option>
      {regions.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
    </select>
  )
}

function budgetFor(state) {
  const id = state.playerFactionId
  const base = ACTION_BUDGET[id]
  return id === 'halk' ? base + (state.factions.halk.bonusActionPoints || 0) : base
}

function HalkActions({ state, draft, setDraft }) {
  const budget = budgetFor(state)
  const usedRegions = new Set(draft.map((a) => a.params.regionId))

  function toggle(regionId, actionKey) {
    setDraft((prev) => {
      const existing = prev.find((a) => a.params.regionId === regionId)
      if (existing && existing.actionKey === actionKey) {
        return prev.filter((a) => a.params.regionId !== regionId)
      }
      const withoutRegion = prev.filter((a) => a.params.regionId !== regionId)
      if (withoutRegion.length >= budget) return prev
      return [...withoutRegion, { actionKey, params: { regionId } }]
    })
  }

  return (
    <div>
      <SectionTitle subtitle={`Eylem puanı: ${draft.length}/${budget} · her bölgeye tek eylem`}>
        Dağınık Eylemler
      </SectionTitle>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {state.regions.map((r) => {
          const current = draft.find((a) => a.params.regionId === r.id)
          return (
            <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
              <div className="text-sm text-white font-medium mb-1.5">{r.name}</div>
              <div className="flex gap-1.5 flex-wrap">
                {['orgutlenme', 'grev', 'yatirim'].map((key) => (
                  <button
                    key={key}
                    onClick={() => toggle(r.id, key)}
                    disabled={!current && usedRegions.size >= budget && !usedRegions.has(r.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border disabled:opacity-30 ${
                      current?.actionKey === key
                        ? 'border-red-500 bg-red-950/50 text-red-300'
                        : 'border-slate-700 text-slate-400'
                    }`}
                  >
                    {FACTION_ACTIONS.halk[key].label}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SirketActions({ state, draft, setDraft }) {
  const budget = budgetFor(state)
  const [regionPick, setRegionPick] = useState('')
  const spent = draft.reduce((s, a) => s + (FACTION_ACTIONS.sirket[a.actionKey].cost || 0), 0)
  const remainingCapital = state.factions.sirket.resources.capital - spent

  function canAfford(actionKey) {
    return draft.length < budget && remainingCapital >= (FACTION_ACTIONS.sirket[actionKey].cost || 0)
  }
  function add(actionKey, params = {}) {
    if (!canAfford(actionKey)) return
    setDraft((prev) => [...prev, { actionKey, params }])
  }
  function remove(idx) {
    setDraft((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <SectionTitle subtitle={`${draft.length}/${budget} karar · kalan sermaye: ${Math.round(remainingCapital)}`}>
        Yönetim Kurulu Kararları
      </SectionTitle>
      <div className="flex items-center gap-2 mb-3">
        <RegionSelect regions={state.regions} value={regionPick} onChange={setRegionPick} />
        <Button
          variant="ghost"
          disabled={!regionPick || !canAfford('fabrikaKur')}
          onClick={() => add('fabrikaKur', { regionId: regionPick })}
        >
          Fabrika Kur (18)
        </Button>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <RegionSelect regions={state.regions} value={regionPick} onChange={setRegionPick} />
        <Button
          variant="ghost"
          disabled={!regionPick || !canAfford('otomasyonaGec')}
          onClick={() => add('otomasyonaGec', { regionId: regionPick })}
        >
          Otomasyona Geç (10)
        </Button>
      </div>
      <Button variant="ghost" disabled={!canAfford('lobi')} onClick={() => add('lobi')}>
        Lobi Faaliyeti (8)
      </Button>

      {draft.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {draft.map((a, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm">
              <span className="text-slate-300">
                {FACTION_ACTIONS.sirket[a.actionKey].label}
                {a.params.regionId && ` · ${state.regions.find((r) => r.id === a.params.regionId)?.name}`}
              </span>
              <button onClick={() => remove(i)} className="text-red-400 text-xs">
                Kaldır
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DevletActions({ state, draft, setDraft }) {
  const [regionPick, setRegionPick] = useState('')
  const selectedKey = draft[0]?.actionKey || null

  function choose(actionKey, params = {}) {
    setDraft([{ actionKey, params }])
  }

  return (
    <div>
      <SectionTitle subtitle="Bu kararlar 1 tur sonra yürürlüğe girer">Bütçe Kararı (1 adet)</SectionTitle>
      <div className="space-y-2">
        <Card selected={selectedKey === 'vergiArtir'} onClick={() => choose('vergiArtir')}>
          <div className="text-sm font-medium text-white">Vergiyi Artır</div>
          <div className="text-xs text-slate-400">Vergi oranı %3 artar (Devlet geliri ↑)</div>
        </Card>
        <Card selected={selectedKey === 'vergiAzalt'} onClick={() => choose('vergiAzalt')}>
          <div className="text-sm font-medium text-white">Vergiyi Azalt</div>
          <div className="text-xs text-slate-400">Vergi oranı %3 azalır (Şirket rahatlar)</div>
        </Card>
        <Card selected={selectedKey === 'subvansiyon'}>
          <div className="text-sm font-medium text-white mb-1.5">Bölgesel Sübvansiyon</div>
          <div className="flex items-center gap-2">
            <RegionSelect
              regions={state.regions}
              value={regionPick}
              onChange={(v) => {
                setRegionPick(v)
                if (v) choose('subvansiyon', { regionId: v })
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}

function FinansActions({ state, draft, setDraft }) {
  const budget = budgetFor(state)
  const [target, setTarget] = useState('halk')
  const [regionPick, setRegionPick] = useState('')
  const [direction, setDirection] = useState('artis')
  const spent = draft.reduce((s, a) => s + (FACTION_ACTIONS.finans[a.actionKey].cost || 0), 0)
  const remainingCapital = state.factions.finans.resources.capital - spent

  function canAfford(actionKey) {
    return draft.length < budget && remainingCapital >= (FACTION_ACTIONS.finans[actionKey].cost || 0)
  }
  function add(actionKey, params) {
    if (!canAfford(actionKey)) return
    setDraft((prev) => [...prev, { actionKey, params }])
  }
  function remove(idx) {
    setDraft((prev) => prev.filter((_, i) => i !== idx))
  }

  const otherFactions = ['halk', 'sirket', 'devlet']

  return (
    <div>
      <SectionTitle subtitle={`${draft.length}/${budget} sözleşme · kalan sermaye: ${Math.round(remainingCapital)}`}>
        Sözleşme Ağı
      </SectionTitle>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 mb-2">
        <div className="text-sm text-white font-medium mb-1.5">Kredi Ver (15)</div>
        <div className="flex items-center gap-2">
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="bg-slate-800 text-white text-sm rounded-lg px-2 py-1.5 border border-slate-700"
          >
            {otherFactions.map((id) => (
              <option key={id} value={id}>
                {FACTIONS[id].shortName}
              </option>
            ))}
          </select>
          <Button variant="ghost" disabled={!canAfford('krediVer')} onClick={() => add('krediVer', { targetFactionId: target })}>
            Ekle
          </Button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
        <div className="text-sm text-white font-medium mb-1.5">Pozisyon Aç (10)</div>
        <div className="flex items-center gap-2 flex-wrap">
          <RegionSelect regions={state.regions} value={regionPick} onChange={setRegionPick} />
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="bg-slate-800 text-white text-sm rounded-lg px-2 py-1.5 border border-slate-700"
          >
            <option value="artis">Üretim Artar</option>
            <option value="azalis">Üretim Azalır</option>
          </select>
          <Button
            variant="ghost"
            disabled={!regionPick || !canAfford('pozisyonAc')}
            onClick={() => add('pozisyonAc', { regionId: regionPick, direction })}
          >
            Ekle
          </Button>
        </div>
      </div>

      {draft.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {draft.map((a, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm">
              <span className="text-slate-300">
                {a.actionKey === 'krediVer'
                  ? `Kredi → ${FACTIONS[a.params.targetFactionId].shortName}`
                  : `Pozisyon: ${state.regions.find((r) => r.id === a.params.regionId)?.name} (${a.params.direction === 'artis' ? 'artış' : 'azalış'})`}
              </span>
              <button onClick={() => remove(i)} className="text-red-400 text-xs">
                Kaldır
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const ACTION_COMPONENTS = {
  halk: HalkActions,
  sirket: SirketActions,
  devlet: DevletActions,
  finans: FinansActions,
}

export default function PlayScreen({ state, selectCard, setPlayerAction, endTurn }) {
  const faction = state.factions[state.playerFactionId]
  const [draft, setDraft] = useState(faction.pendingAction || [])

  useEffect(() => {
    setPlayerAction(draft)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  const ActionComponent = ACTION_COMPONENTS[state.playerFactionId]
  const canEndTurn = Boolean(faction.selectedCardId)

  return (
    <div className="p-4 pb-32 space-y-6">
      <PolicyHand state={state} selectCard={selectCard} />
      <ActionComponent state={state} draft={draft} setDraft={setDraft} />

      <div className="fixed bottom-16 left-0 right-0 max-w-[480px] mx-auto p-3 bg-slate-950/95 border-t border-slate-800 z-20">
        {!canEndTurn && <div className="text-xs text-amber-400 mb-2 text-center">Devam etmek için bir politika kartı seç</div>}
        <Button className="w-full" disabled={!canEndTurn} onClick={endTurn}>
          Turu Bitir ({state.turn}/{state.maxTurns})
        </Button>
      </div>
    </div>
  )
}
