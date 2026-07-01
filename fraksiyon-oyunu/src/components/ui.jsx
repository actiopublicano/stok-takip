export function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-700 text-slate-200',
    red: 'bg-red-900/60 text-red-300',
    green: 'bg-emerald-900/60 text-emerald-300',
    amber: 'bg-amber-900/60 text-amber-300',
    blue: 'bg-blue-900/60 text-blue-300',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tones[tone]}`}>{children}</span>
}

export function ProgressBar({ value, color = '#2563eb' }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export function SectionTitle({ children, subtitle }) {
  return (
    <div className="mb-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{children}</h2>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  )
}

export function Button({ children, onClick, variant = 'primary', disabled, className = '' }) {
  const variants = {
    primary: 'bg-blue-600 text-white active:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500',
    ghost: 'bg-slate-800 text-slate-200 active:bg-slate-700',
    danger: 'bg-red-700 text-white active:bg-red-800',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Card({ children, selected, onClick, className = '' }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-3 transition-colors ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''} ${
        selected ? 'border-blue-500 bg-blue-950/40' : 'border-slate-800 bg-slate-900'
      } ${className}`}
    >
      {children}
    </div>
  )
}
