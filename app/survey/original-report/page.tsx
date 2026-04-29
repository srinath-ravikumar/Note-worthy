'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProgressBar from '@/components/ProgressBar'
import MedicalReport from '@/components/MedicalReport'
import LikertScale from '@/components/LikertScale'
import { useSurveyStore } from '@/lib/store'
import { TERMINOLOGY_OPTIONS, FINDING_LABELS, PREFERRED_STRUCTURE_OPTIONS } from '@/data/questions'
import { MEDICAL_REPORT_TITLE, MEDICAL_REPORT_TEXT } from '@/data/medical-report'
import type { PreSurveyAnswers } from '@/lib/types'

const EMPTY_PRE: PreSurveyAnswers = {
  understoodWhole: '',
  unfamiliarTerms: [],
  unfamiliarTermsOther: '',
  quantitativeUnderstanding: 0,
  findingRatings: {},
  recommendationRating: 0,
  preferredStructure: '',
  highlightPreferences: '',
}

export default function OriginalReportPage() {
  const router = useRouter()
  const { state, update, loaded } = useSurveyStore()
  const [phase, setPhase] = useState<'read' | 'survey'>('read')
  const [answers, setAnswers] = useState<PreSurveyAnswers>(EMPTY_PRE)
  const [error, setError] = useState('')

  useEffect(() => {
    if (loaded && !state.metadata) router.replace('/survey/metadata')
  }, [loaded, state.metadata, router])

  function setField<K extends keyof PreSurveyAnswers>(key: K, value: PreSurveyAnswers[K]) {
    setAnswers(prev => ({ ...prev, [key]: value }))
    setError('')
  }

  function toggleTerm(value: string) {
    setAnswers(prev => ({
      ...prev,
      unfamiliarTerms: prev.unfamiliarTerms.includes(value)
        ? prev.unfamiliarTerms.filter(v => v !== value)
        : [...prev.unfamiliarTerms, value],
    }))
  }

  function setFindingRating(id: string, value: number) {
    setAnswers(prev => ({
      ...prev,
      findingRatings: { ...prev.findingRatings, [id]: value },
    }))
    setError('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!answers.understoodWhole) {
      setError('Please answer whether you were able to understand the document.')
      return
    }
    if (!answers.quantitativeUnderstanding) {
      setError('Please rate how much the quantitative measurements made sense.')
      return
    }
    const missingFinding = FINDING_LABELS.find(f => !answers.findingRatings[f.id])
    if (missingFinding) {
      setError(`Please rate your understanding of: ${missingFinding.label}`)
      return
    }
    if (!answers.recommendationRating) {
      setError('Please rate your understanding of the Recommendations section.')
      return
    }
    if (!answers.preferredStructure) {
      setError('Please select your preferred report structure.')
      return
    }

    update({ preSurvey: answers, currentStep: 3 })
    router.push('/survey/processing')
  }

  return (
    <div>
      <ProgressBar currentStep={2} />
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* ── PHASE 1: READ ── */}
        {phase === 'read' && (
          <>
            <div>
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Section 2 — Original Report</div>
              <h1 className="text-2xl font-bold text-slate-900">Read the Medical Report</h1>
              <p className="text-slate-500 mt-1">
                Take your time reading through this clinical report. You will answer questions about it afterward.
              </p>
            </div>
            <MedicalReport title={MEDICAL_REPORT_TITLE} content={MEDICAL_REPORT_TEXT} variant="original" />
            <div className="flex justify-end">
              <button onClick={() => { setPhase('survey'); window.scrollTo(0, 0) }} className="btn-primary">
                I&apos;ve finished reading — Answer Questions →
              </button>
            </div>
          </>
        )}

        {/* ── PHASE 2: PRE-SURVEY ── */}
        {phase === 'survey' && (
          <>
            <div>
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Section 2 — Before Reading the Rewrite</div>
              <h1 className="text-2xl font-bold text-slate-900">Your Reactions to the Original Report</h1>
              <p className="text-slate-500 mt-1">Answer based on what you just read.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Q1: Understood whole document */}
              <div className="card p-5 space-y-3">
                <p className="font-medium text-slate-800">Were you able to understand the whole document?</p>
                <div className="flex gap-3">
                  {[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }].map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2 px-5 py-3 rounded-lg border cursor-pointer transition-colors flex-1 justify-center
                        ${answers.understoodWhole === opt.value
                          ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                    >
                      <input
                        type="radio"
                        name="understoodWhole"
                        value={opt.value}
                        checked={answers.understoodWhole === opt.value}
                        onChange={() => setField('understoodWhole', opt.value)}
                        className="accent-blue-600"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Q2: Unfamiliar terminology checkboxes */}
              <div className="card p-5 space-y-4">
                <div>
                  <p className="font-medium text-slate-800">Which of the following terms did you <span className="underline">not</span> understand?</p>
                  <p className="text-sm text-slate-500 mt-0.5">Select all that apply. Leave blank if you understood everything.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TERMINOLOGY_OPTIONS.map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                        ${answers.unfamiliarTerms.includes(opt.value)
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'}`}
                    >
                      <input
                        type="checkbox"
                        checked={answers.unfamiliarTerms.includes(opt.value)}
                        onChange={() => toggleTerm(opt.value)}
                        className="accent-blue-600 w-4 h-4 flex-none"
                      />
                      <span className="text-sm text-slate-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Others (please specify):</label>
                  <input
                    type="text"
                    value={answers.unfamiliarTermsOther}
                    onChange={e => setField('unfamiliarTermsOther', e.target.value)}
                    placeholder="Any other terms you found confusing..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              {/* Q3: Quantitative measurements */}
              <div className="card p-5">
                <LikertScale
                  id="quantitativeUnderstanding"
                  question="How much of the quantitative measurements (the numbers table) made sense to you?"
                  value={answers.quantitativeUnderstanding || null}
                  lowLabel="None of it"
                  highLabel="All of it"
                  onChange={v => setField('quantitativeUnderstanding', v)}
                />
              </div>

              {/* Q4: Per-finding ratings */}
              <div className="card p-5 space-y-6">
                <div>
                  <p className="font-medium text-slate-800">Rate your level of understanding for each finding in the report:</p>
                  <p className="text-sm text-slate-500 mt-0.5">1 = Poorly understood &nbsp;·&nbsp; 5 = Well understood</p>
                </div>
                {FINDING_LABELS.map(f => (
                  <LikertScale
                    key={f.id}
                    id={f.id}
                    question={f.label}
                    value={answers.findingRatings[f.id] || null}
                    lowLabel="Poorly understood"
                    highLabel="Well understood"
                    onChange={v => setFindingRating(f.id, v)}
                  />
                ))}
              </div>

              {/* Q5: Recommendations rating */}
              <div className="card p-5">
                <LikertScale
                  id="recommendationRating"
                  question="Rate your level of understanding for the Recommendations section:"
                  value={answers.recommendationRating || null}
                  lowLabel="Poorly understood"
                  highLabel="Well understood"
                  onChange={v => setField('recommendationRating', v)}
                />
              </div>

              {/* Q6: Preferred structure */}
              <div className="card p-5 space-y-3">
                <p className="font-medium text-slate-800">What structure would you have preferred this report to be in?</p>
                <div className="space-y-2">
                  {PREFERRED_STRUCTURE_OPTIONS.map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                        ${answers.preferredStructure === opt.value
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                    >
                      <input
                        type="radio"
                        name="preferredStructure"
                        value={opt.value}
                        checked={answers.preferredStructure === opt.value}
                        onChange={() => setField('preferredStructure', opt.value)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Q7: Highlight preferences (optional) */}
              <div className="card p-5 space-y-3">
                <label className="font-medium text-slate-800">
                  Is there anything specific you always want highlighted in a medical document?{' '}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={answers.highlightPreferences}
                  onChange={e => setField('highlightPreferences', e.target.value)}
                  placeholder="e.g., Next steps, risk levels, medication changes, follow-up dates..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between">
                <button type="button" onClick={() => { setPhase('read'); window.scrollTo(0, 0) }} className="btn-secondary">
                  ← Back to Report
                </button>
                <button type="submit" className="btn-primary">
                  Generate My Personalized Report →
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
