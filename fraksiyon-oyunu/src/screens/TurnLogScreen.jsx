import { SectionTitle } from '../components/ui.jsx'

export default function TurnLogScreen({ state }) {
  return (
    <div className="p-4 pb-24">
      <SectionTitle subtitle="En son turdan başlayarak">Olay Günlüğü</SectionTitle>
      {state.turnLog.length === 0 ? (
        <p className="text-sm text-slate-500">Henüz bir tur oynanmadı.</p>
      ) : (
        <ul className="space-y-2">
          {state.turnLog.map((entry, i) => (
            <li key={i} className="text-sm text-slate-300 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
              {entry}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
