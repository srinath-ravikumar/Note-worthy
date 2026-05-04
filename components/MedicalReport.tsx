'use client'

import ReactMarkdown from 'react-markdown'

interface Props {
  title: string
  content: string
  variant?: 'original' | 'generic' | 'personalized'
}

const VARIANT_STYLES = {
  original: {
    wrap: 'border-slate-200 bg-white',
    header: 'bg-slate-700 border-slate-600',
    badge: 'bg-slate-500 text-slate-200',
    label: 'Original Clinical Report',
    badgeText: 'Unmodified',
  },
  generic: {
    wrap: 'border-teal-300 bg-teal-50',
    header: 'bg-teal-600 border-teal-500',
    badge: 'bg-teal-100 text-teal-800',
    label: 'Plain Language Version',
    badgeText: 'AI-Rewritten',
  },
  personalized: {
    wrap: 'border-blue-300 bg-blue-50',
    header: 'bg-blue-600 border-blue-500',
    badge: 'bg-blue-100 text-blue-800',
    label: 'Personalized Version',
    badgeText: 'AI-Personalized',
  },
}

export default function MedicalReport({ title, content, variant = 'original' }: Props) {
  const s = VARIANT_STYLES[variant]
  return (
    <div className={`rounded-xl border-2 shadow-sm overflow-hidden ${s.wrap}`}>
      <div className={`px-6 py-3 flex items-center gap-2 border-b ${s.header}`}>
        <span className="text-white text-sm font-semibold uppercase tracking-wider">
          {s.label}
        </span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${s.badge}`}>
          {s.badgeText}
        </span>
      </div>
      <div className="px-6 py-5">
        <h2 className="text-lg font-bold text-slate-900 mb-4">{title}</h2>
        {variant !== 'original' ? (
          <div className="prose prose-slate prose-sm max-w-none
            prose-headings:font-bold prose-headings:text-slate-900
            prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
            prose-strong:text-slate-800
            prose-ul:my-2 prose-li:my-0.5
            prose-hr:border-slate-300
            prose-p:text-slate-700 prose-p:leading-relaxed">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 leading-relaxed">
            {content}
          </pre>
        )}
      </div>
    </div>
  )
}
