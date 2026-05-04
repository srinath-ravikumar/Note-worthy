'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProgressBar from '@/components/ProgressBar'
import MedicalReport from '@/components/MedicalReport'
import LikertScale from '@/components/LikertScale'
import { useSurveyStore } from '@/lib/store'
import { PART_B_QUESTIONS } from '@/data/questions'
import { MEDICAL_REPORT_TITLE, MEDICAL_REPORT_TEXT } from '@/data/medical-report'
import type { VersionRating } from '@/lib/types'

const VERSION_LABELS: Record<string, string> = {
  original: 'Original Clinical Report',
  generic: 'Plain Language Version',
  personalized: 'Personalized Version',
}

const EMPTY_RATING: VersionRating = {
  understood: 0,
  languageClear: 0,
  detailRight: 0,
  feltPersonalized: 0,
  wouldPrefer: 0,
  mcqAnswers: {},
}

export default function ReadingPage() {
  const router = useRouter()
  const { state, update, loaded } = useSurveyStore()
  const [rating, setRating] = useState<VersionRating>(EMPTY_RATING)
  const [error, setError] = useState('')

  useEffect(() => {
    if (loaded && (!state.metadata || !state.versionOrder)) {
      router.replace('/survey/metadata')
    }
  }, [loaded, state.metadata, state.versionOrder, router])

  if (!loaded || !state.versionOrder) return null

  const versionKey = state.versionOrder[state.currentVersionIndex]
  const versionLabel = VERSION_LABELS[versionKey]
  const subLabel = `Report ${state.currentVersionIndex + 1} of 3`

  function getContent(): string {
    if (versionKey === 'original') return MEDICAL_REPORT_TEXT
    if (versionKey === 'generic') return state.genericRewrite ?? ''
    return state.personalizedRewrite ?? ''
  }

  function getVariant(): 'original' | 'personalized' {
    return versionKey === 'original' ? 'original' : 'personalized'
  }

  function setRatingField(field: keyof VersionRating, value: number) {
    setRating(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  function handleSubmitRating(e: { preventDefault(): void }) {
    e.preventDefault()

    for (const q of PART_B_QUESTIONS) {
      if (!rating[q.id as keyof VersionRating]) {
        setError(`Please answer: "${q.label}"`)
        return
      }
    }

    const newRatings = { ...state.versionRatings, [versionKey]: rating }
    const nextIndex = state.currentVersionIndex + 1

    if (nextIndex < 3) {
      update({ versionRatings: newRatings, currentVersionIndex: nextIndex })
      setRating(EMPTY_RATING)
      window.scrollTo(0, 0)
    } else {
      update({ versionRatings: newRatings, currentStep: 3, currentVersionIndex: 3 })
      router.push('/survey/final')
    }
  }

  return (
    <div>
      <ProgressBar currentStep={2} subLabel={subLabel} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            {subLabel}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{versionLabel}</h1>
          <p className="text-slate-500 mt-1">
            Read the report on the left, then answer the rating questions on the right.
          </p>
        </div>

        <form onSubmit={handleSubmitRating}>
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Left: Report — sticky so it stays visible while scrolling questions */}
            <div className="w-full lg:flex-1 lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
              <MedicalReport
                title={MEDICAL_REPORT_TITLE}
                content={getContent()}
                variant={getVariant()}
              />
            </div>

            {/* Right: Rating questions */}
            <div className="w-full lg:w-[420px] space-y-5 flex-none">
              <div className="card p-5 space-y-6">
                <div>
                  <h2 className="font-semibold text-slate-800">Rate This Version</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    1 = Strongly Disagree, 5 = Strongly Agree
                  </p>
                </div>
                {PART_B_QUESTIONS.map(q => (
                  <LikertScale
                    key={q.id}
                    id={q.id}
                    question={q.label}
                    value={(rating[q.id as keyof VersionRating] as number) || null}
                    lowLabel="Strongly Disagree"
                    highLabel="Strongly Agree"
                    onChange={v => setRatingField(q.id as keyof VersionRating, v)}
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}

              <div className="flex justify-end">
                <button type="submit" className="btn-primary">
                  {state.currentVersionIndex < 2 ? 'Next Report →' : 'Final Comparison →'}
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}
