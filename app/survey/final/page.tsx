'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProgressBar from '@/components/ProgressBar'
import { useSurveyStore } from '@/lib/store'
import type { FinalComparison } from '@/lib/types'

const VERSION_OPTIONS = [
  { value: 'original', label: 'Original Clinical Report' },
  { value: 'generic', label: 'Plain Language Version' },
  { value: 'personalized', label: 'Personalized Version' },
]

export default function FinalPage() {
  const router = useRouter()
  const { state, update, loaded } = useSurveyStore()
  const [ranking, setRanking] = useState<string[]>([])
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (loaded && (!state.metadata || state.currentVersionIndex < 3)) {
      router.replace('/survey/metadata')
    }
  }, [loaded, state.metadata, state.currentVersionIndex, router])

  if (!loaded || !state.metadata) return null

  function toggleRank(value: string) {
    setRanking(prev => {
      if (prev.includes(value)) return prev.filter(v => v !== value)
      if (prev.length < 3) return [...prev, value]
      return prev
    })
    setError('')
  }

  function rankLabel(value: string): string {
    const idx = ranking.indexOf(value)
    if (idx === 0) return '1st'
    if (idx === 1) return '2nd'
    if (idx === 2) return '3rd'
    return ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (ranking.length < 3) {
      setError('Please rank all three versions before submitting.')
      return
    }

    const finalComparison: FinalComparison = { ranking, comments }
    update({ finalComparison, completedAt: new Date().toISOString(), currentStep: 4 })
    setSubmitting(true)

    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: state.participantId,
          startedAt: state.startedAt,
          metadata: state.metadata,
          genericRewrite: state.genericRewrite,
          personalizedRewrite: state.personalizedRewrite,
          llmPrompt: state.llmPrompt,
          dynamicMCQs: state.dynamicMCQs,
          versionOrder: state.versionOrder,
          versionRatings: state.versionRatings,
          finalComparison,
        }),
      })
    } catch (err) {
      console.error('Failed to save response:', err)
      // still redirect — data is safe in localStorage
    }

    router.push('/survey/complete')
  }

  return (
    <div>
      <ProgressBar currentStep={3} />
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <div>
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Final Step</div>
          <h1 className="text-2xl font-bold text-slate-900">Compare All Three Versions</h1>
          <p className="text-slate-500 mt-1">
            Rank the three versions you read from most to least preferred by clicking them in order.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ranking */}
          <div className="card p-5 space-y-3">
            <p className="font-medium text-slate-800">
              Click each version to rank them. Your first click = 1st preference, second click = 2nd, third = 3rd.
            </p>
            {ranking.length > 0 && (
              <p className="text-sm text-slate-500">Click a ranked version again to remove it.</p>
            )}
            <div className="space-y-3 mt-2">
              {VERSION_OPTIONS.map(opt => {
                const rank = rankLabel(opt.value)
                const ranked = !!rank
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleRank(opt.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-colors
                      ${ranked
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-none
                      ${ranked ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {rank || '—'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{opt.label}</p>
                      {rank === '1st' && <p className="text-xs text-blue-600 mt-0.5">Most preferred</p>}
                      {rank === '3rd' && <p className="text-xs text-slate-400 mt-0.5">Least preferred</p>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Open-ended */}
          <div className="card p-5 space-y-3">
            <label className="font-medium text-slate-800">
              In one sentence, what made your top choice better?{' '}
              <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              placeholder="e.g. It used simpler words and felt easier to follow..."
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Submitting...' : 'Submit & Complete Survey →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
