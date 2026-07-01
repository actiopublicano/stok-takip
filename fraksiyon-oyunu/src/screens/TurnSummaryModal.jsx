import { Button } from '../components/ui.jsx'

export default function TurnSummaryModal({ entries, turn, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50">
      <div className="w-full max-w-[480px] bg-slate-950 border-t border-slate-800 rounded-t-3xl p-5 max-h-[75vh] flex flex-col">
        <h2 className="text-lg font-bold text-white mb-1">Tur {turn} Özeti</h2>
        <p className="text-xs text-slate-500 mb-3">Bu turda gerçekleşenler</p>
        <div className="overflow-y-auto flex-1 space-y-2 mb-4">
          {entries.length === 0 ? (
            <p className="text-sm text-slate-500">Bu turda dikkat çekici bir olay olmadı.</p>
          ) : (
            entries.map((entry, i) => (
              <div key={i} className="text-sm text-slate-300 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
                {entry}
              </div>
            ))
          )}
        </div>
        <Button className="w-full" onClick={onClose}>
          Devam Et
        </Button>
      </div>
    </div>
  )
}
