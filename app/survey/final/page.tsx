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
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (loaded && (!state.metadata || state.currentVersionIndex < 3)) {
      router.replace('/survey/metadata')
    }
  }, [loaded, state.metadata, state.currentVersionIndex, router])

  if (!loaded || !state.metadata) return null

  const mcqs = state.dynamicMCQs ?? []

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

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()

    if (mcqs.length > 0) {
      const unanswered = mcqs.findIndex((_, i) => !mcqAnswers[i])
      if (unanswered !== -1) {
        setError(`Please answer comprehension question ${unanswered + 1}.`)
        return
      }
    }

    if (ranking.length < 3) {
      setError('Please rank all three versions before submitting.')
      return
    }

    const finalComparison: FinalComparison = { ranking, comments }
    update({ finalComparison, completedAt: new Date().toISOString(), currentStep: 4 })
    setSubmitting(true)

    // Merge MCQ answers into the personalized version's ratings for storage
    const enrichedRatings = {
      ...state.versionRatings,
      ...(state.versionRatings?.personalized
        ? { personalized: { ...state.versionRatings.personalized, mcqAnswers } }
        : {}),
    }

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
          versionRatings: enrichedRatings,
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
            Answer the comprehension questions below, then rank the three versions you read.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Comprehension Quiz — asked once after all 3 versions */}
          {mcqs.length > 0 && (
            <div className="card p-6 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-slate-700 border-b pb-2">
                  Comprehension Quiz
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                  Based on the reports you just read, answer these questions to test your understanding.
                </p>
              </div>
              {mcqs.map((q, idx) => (
                <div key={idx} className="space-y-3">
                  <p className="font-medium text-slate-800">
                    <span className="text-slate-400 mr-1">{idx + 1}.</span> {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map(opt => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                          ${mcqAnswers[idx] === opt.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                      >
                        <input
                          type="radio"
                          name={`mcq-${idx}`}
                          value={opt.value}
                          checked={mcqAnswers[idx] === opt.value}
                          onChange={() => {
                            setMcqAnswers(prev => ({ ...prev, [idx]: opt.value }))
                            setError('')
                          }}
                          className="accent-blue-600"
                        />
                        <span className="text-sm text-slate-700">
                          <span className="font-medium uppercase mr-1">{opt.value}.</span>
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

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
