'use client'

const STEPS = [
  { label: 'About You', step: 1 },
  { label: 'Read & Rate', step: 2 },
  { label: 'Compare', step: 3 },
  { label: 'Complete', step: 4 },
]

interface Props {
  currentStep: number   // 1–4
  subLabel?: string     // e.g. "Report 2 of 3"
}

export default function ProgressBar({ currentStep, subLabel }: Props) {
  return (
    <div className="w-full py-4 px-6 bg-white border-b border-slate-200">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          {STEPS.map((s, idx) => {
            const done = currentStep > s.step
            const active = currentStep === s.step
            return (
              <div key={s.step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                      ${done ? 'bg-blue-600 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-500'}`}
                  >
                    {done ? '✓' : s.step}
                  </div>
                  <span className={`mt-1 text-xs font-medium hidden sm:block ${active ? 'text-blue-700' : done ? 'text-blue-600' : 'text-slate-400'}`}>
                    {s.label}
                    {active && subLabel && (
                      <span className="block text-blue-500 font-normal">{subLabel}</span>
                    )}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors ${done ? 'bg-blue-600' : 'bg-slate-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
