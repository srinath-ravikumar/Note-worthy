'use client'

interface Props {
  id: string
  question: string
  value: number | null
  lowLabel: string
  highLabel: string
  onChange: (value: number) => void
}

export default function LikertScale({ id, question, value, lowLabel, highLabel, onChange }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-slate-800 font-medium leading-snug">{question}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 w-24 text-right leading-tight hidden sm:block">{lowLabel}</span>
        <div className="flex gap-2 flex-1 justify-center sm:justify-start">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`w-11 h-11 rounded-full border-2 text-sm font-semibold transition-all
                ${value === n
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-110'
                  : 'border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
                }`}
              aria-label={`${n} — ${n === 1 ? lowLabel : n === 5 ? highLabel : ''}`}
            >
              {n}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 w-24 leading-tight hidden sm:block">{highLabel}</span>
      </div>
      <div className="flex justify-between text-xs text-slate-400 sm:hidden px-1">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  )
}
