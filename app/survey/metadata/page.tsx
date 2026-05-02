'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProgressBar from '@/components/ProgressBar'
import { useSurveyStore } from '@/lib/store'
import { METADATA_FIELDS, TERM_FAMILIARITY_TERMS } from '@/data/questions'
import type { UserMetadata } from '@/lib/types'

const EMPTY: UserMetadata = {
  ageGroup: '',
  education: '',
  englishFirstLanguage: '',
  medicalBackground: '',
  readingFrequency: '',
  chronicCondition: '',
  termFamiliarity: {},
  readingPurpose: '',
  preferredStructure: '',
}

export default function MetadataPage() {
  const router = useRouter()
  const { update } = useSurveyStore()
  const [answers, setAnswers] = useState<UserMetadata>(EMPTY)
  const [error, setError] = useState('')

  function setField<K extends keyof UserMetadata>(id: K, value: UserMetadata[K]) {
    setAnswers(prev => ({ ...prev, [id]: value }))
    setError('')
  }

  function toggleTerm(termId: string) {
    setAnswers(prev => ({
      ...prev,
      termFamiliarity: {
        ...prev.termFamiliarity,
        [termId]: !prev.termFamiliarity[termId],
      },
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const missing = METADATA_FIELDS.filter(f => {
      const val = answers[f.id as keyof UserMetadata]
      return f.required && (!val || (typeof val === 'string' && !val))
    })
    if (missing.length > 0) {
      setError('Please answer all questions before continuing.')
      return
    }

    update({ metadata: answers, currentStep: 2 })
    router.push('/survey/processing')
  }

  return (
    <div>
      <ProgressBar currentStep={1} />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Section 1 — About You</h1>
          <p className="text-slate-500 mt-1">
            This information helps us personalize the medical report for someone with your background.
            All responses are anonymous.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Radio questions */}
          {METADATA_FIELDS.map(field => (
            <div key={field.id} className="card p-5 space-y-3">
              <p className="font-medium text-slate-800">{field.label}</p>
              <div className="space-y-2">
                {field.options.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                      ${answers[field.id as keyof UserMetadata] === opt.value
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                  >
                    <input
                      type="radio"
                      name={field.id}
                      value={opt.value}
                      checked={answers[field.id as keyof UserMetadata] === opt.value}
                      onChange={() => setField(field.id as keyof UserMetadata, opt.value)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Term familiarity test */}
          <div className="card p-5 space-y-4">
            <div>
              <p className="font-medium text-slate-800">
                For each term below, select <span className="text-blue-700 font-semibold">"I know this"</span> if you know what it means:
              </p>
              <p className="text-sm text-slate-500 mt-0.5">Leave blank if you are unsure — there are no wrong answers.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TERM_FAMILIARITY_TERMS.map(term => {
                const known = !!answers.termFamiliarity[term.id]
                return (
                  <button
                    key={term.id}
                    type="button"
                    onClick={() => toggleTerm(term.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors
                      ${known
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                  >
                    <span className={`w-5 h-5 rounded flex-none flex items-center justify-center text-xs font-bold border
                      ${known ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}>
                      {known ? '✓' : ''}
                    </span>
                    <span className="text-sm">{term.label}</span>
                    {known && <span className="ml-auto text-xs text-green-600 font-medium">I know this</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <button type="submit" className="btn-primary">
              Next: Generate My Reports →
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
