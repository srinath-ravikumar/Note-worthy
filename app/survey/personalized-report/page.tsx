'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProgressBar from '@/components/ProgressBar'
import MedicalReport from '@/components/MedicalReport'
import LikertScale from '@/components/LikertScale'
import { useSurveyStore } from '@/lib/store'
import { VERSION_PREFERENCE_OPTIONS } from '@/data/questions'
import { MEDICAL_REPORT_TITLE } from '@/data/medical-report'
import type { PostSurveyAnswers } from '@/lib/types'

const EMPTY_POST: PostSurveyAnswers = {
  easeOfUnderstanding: 0,
  detailMatch: 0,
  structureMatch: 0,
  versionPreference: '',
  mcqAnswers: {},
  openComments: '',
}

export default function PersonalizedReportPage() {
  const router = useRouter()
  const { state, update } = useSurveyStore()
  const [phase, setPhase] = useState<'read' | 'survey'>('read')
  const [answers, setAnswers] = useState<PostSurveyAnswers>(EMPTY_POST)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!state.llmRewrite) router.replace('/survey/original-report')
  }, [state.llmRewrite, router])

  function setField<K extends keyof PostSurveyAnswers>(key: K, value: PostSurveyAnswers[K]) {
    setAnswers(prev => ({ ...prev, [key]: value }))
    setError('')
  }

  function setMCQAnswer(idx: number, value: string) {
    setAnswers(prev => ({
      ...prev,
      mcqAnswers: { ...prev.mcqAnswers, [idx]: value },
    }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!answers.easeOfUnderstanding) { setError('Please rate how easy the rewritten document was to understand.'); return }
    if (!answers.detailMatch) { setError('Please rate whether the rewrite matched your preferred level of detail.'); return }
    if (!answers.structureMatch) { setError('Please rate whether the rewrite matched your preferred structure.'); return }
    if (!answers.versionPreference) { setError('Please select your version preference.'); return }

    const mcqs = state.dynamicMCQs ?? []
    const unanswered = mcqs.findIndex((_, i) => !answers.mcqAnswers[i])
    if (mcqs.length > 0 && unanswered !== -1) {
      setError(`Please answer comprehension question ${unanswered + 1}.`)
      return
    }

    const postSurvey: PostSurveyAnswers = answers
    update({ postSurvey, completedAt: new Date().toISOString(), currentStep: 5 })
    setSubmitting(true)

    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: state.participantId,
          startedAt: state.startedAt,
          metadata: state.metadata,
          preSurvey: state.preSurvey,
          llmPrompt: state.llmPrompt,
          llmRewrite: state.llmRewrite,
          dynamicMCQs: state.dynamicMCQs,
          postSurvey,
        }),
      })
    } catch (err) {
      console.error('Failed to save response:', err)
      // still redirect — data is safe in localStorage
    }

    router.push('/survey/complete')
  }

  if (!state.llmRewrite) return null

  const mcqs = state.dynamicMCQs ?? []

  return (
    <div>
      <ProgressBar currentStep={3} />
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* ── PHASE 1: READ ── */}
        {phase === 'read' && (
          <>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Section 3 — Personalized Version</div>
              <h1 className="text-2xl font-bold text-slate-900">Your Personalized Report</h1>
              <p className="text-slate-500">
                This version was rewritten by AI based on your background and preferences.
                Read it carefully and compare it to the original.
              </p>
            </div>
            <MedicalReport title={MEDICAL_REPORT_TITLE} content={state.llmRewrite} variant="personalized" />
            <div className="flex justify-end">
              <button onClick={() => { setPhase('survey'); window.scrollTo(0, 0) }} className="btn-primary">
                I&apos;ve finished reading — Answer Questions →
              </button>
            </div>
          </>
        )}

        {/* ── PHASE 2: POST-SURVEY ── */}
        {phase === 'survey' && (
          <>
            <div>
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Section 3 — Post-Rewrite Evaluation</div>
              <h1 className="text-2xl font-bold text-slate-900">Evaluate the Personalized Version</h1>
              <p className="text-slate-500 mt-1">Compare this version to the original report you read earlier.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Q1: Ease of understanding */}
              <div className="card p-5">
                <LikertScale
                  id="easeOfUnderstanding"
                  question="How easy was it to understand the rewritten document?"
                  value={answers.easeOfUnderstanding || null}
                  lowLabel="Very difficult"
                  highLabel="Very easy"
                  onChange={v => setField('easeOfUnderstanding', v)}
                />
              </div>

              {/* Q2: Detail match */}
              <div className="card p-5">
                <LikertScale
                  id="detailMatch"
                  question="Did the rewrite match the level of detail you preferred?"
                  value={answers.detailMatch || null}
                  lowLabel="Not at all"
                  highLabel="Perfectly"
                  onChange={v => setField('detailMatch', v)}
                />
              </div>

              {/* Q3: Structure match */}
              <div className="card p-5">
                <LikertScale
                  id="structureMatch"
                  question="Did the rewrite match the structure you preferred?"
                  value={answers.structureMatch || null}
                  lowLabel="Not at all"
                  highLabel="Perfectly"
                  onChange={v => setField('structureMatch', v)}
                />
              </div>

              {/* Q4: Version preference */}
              <div className="card p-5 space-y-3">
                <p className="font-medium text-slate-800">
                  Would you prefer to receive this rewritten version from your doctor instead of the original?
                </p>
                <div className="space-y-2">
                  {VERSION_PREFERENCE_OPTIONS.map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                        ${answers.versionPreference === opt.value
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                    >
                      <input
                        type="radio"
                        name="versionPreference"
                        value={opt.value}
                        checked={answers.versionPreference === opt.value}
                        onChange={() => setField('versionPreference', opt.value)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Q5: Dynamic comprehension quiz */}
              {mcqs.length > 0 && (
                <div className="card p-6 space-y-6">
                  <div>
                    <h2 className="text-base font-semibold text-slate-700 border-b pb-2">Comprehension Quiz</h2>
                    <p className="text-sm text-slate-500 mt-2">
                      These questions test factual comprehension of the personalized report you just read.
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
                              ${answers.mcqAnswers[idx] === opt.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                          >
                            <input
                              type="radio"
                              name={`mcq-${idx}`}
                              value={opt.value}
                              checked={answers.mcqAnswers[idx] === opt.value}
                              onChange={() => setMCQAnswer(idx, opt.value)}
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

              {/* Q6: Open comments */}
              <div className="card p-5 space-y-3">
                <label className="font-medium text-slate-800">
                  Any other comments?{' '}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={answers.openComments}
                  onChange={e => setField('openComments', e.target.value)}
                  placeholder="What worked well? What could be improved? Any other thoughts..."
                  rows={4}
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
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Submitting...' : 'Submit & Complete Survey →'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
