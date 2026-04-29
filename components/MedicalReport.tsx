'use client'

interface Props {
  title: string
  content: string
  variant?: 'original' | 'personalized'
}

export default function MedicalReport({ title, content, variant = 'original' }: Props) {
  return (
    <div className={`rounded-xl border-2 shadow-sm overflow-hidden
      ${variant === 'personalized' ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}`}
    >
      <div className={`px-6 py-3 flex items-center gap-2 border-b
        ${variant === 'personalized' ? 'bg-blue-600 border-blue-500' : 'bg-slate-700 border-slate-600'}`}
      >
        <span className="text-white text-sm font-semibold uppercase tracking-wider">
          {variant === 'personalized' ? 'Personalized Report' : 'Original Clinical Report'}
        </span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium
          ${variant === 'personalized' ? 'bg-blue-100 text-blue-800' : 'bg-slate-500 text-slate-200'}`}>
          {variant === 'personalized' ? 'AI-Personalized' : 'Unmodified'}
        </span>
      </div>
      <div className="px-6 py-5">
        <h2 className="text-lg font-bold text-slate-900 mb-4">{title}</h2>
        <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 leading-relaxed">
          {content}
        </pre>
      </div>
    </div>
  )
}
