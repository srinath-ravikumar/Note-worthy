'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProgressBar from '@/components/ProgressBar'
import LikertScale from '@/components/LikertScale'
import { useSurveyStore } from '@/lib/store'
import { METADATA_FIELDS } from '@/data/questions'
import type { UserMetadata } from '@/lib/types'

const EMPTY: UserMetadata = {
  ageGroup: '',
  gender: '',
  education: '',
  medicalBackground: '',
  medicalRole: '',
  terminologyFamiliarity: 0,
  readingFrequency: '',
}

export default function MetadataPage() {
  const router = useRouter()
  const { update } = useSurveyStore()
  const [answers, setAnswers] = useState<UserMetadata>(EMPTY)
  const [error, setError] = useState('')

  function set<K extends keyof UserMetadata>(id: K, value: UserMetadata[K]) {
    setAnswers(prev => ({ ...prev, [id]: value }))
    setError('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const missingFields = METADATA_FIELDS.filter(f => {
      if (f.id === 'readingFrequency') return !answers.readingFrequency
      return f.required && !answers[f.id as keyof UserMetadata]
    })
    if (missingFields.length > 0) {
      setError('Please answer all required questions before continuing.')
      return
    }
    if (!answers.terminologyFamiliarity) {
      setError('Please rate your familiarity with medical terminology.')
      return
    }

    update({ metadata: answers, currentStep: 2 })
    router.push('/survey/original-report')
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
          {/* Age, Gender, Education, Medical Background */}
          {METADATA_FIELDS.slice(0, 4).map(field => (
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
                      onChange={() => set(field.id as keyof UserMetadata, opt.value)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Conditional: medical role */}
          {answers.medicalBackground === 'yes' && (
            <div className="card p-5 space-y-3 border-blue-200 bg-blue-50">
              <label className="font-medium text-slate-800">
                If yes, please specify your role{' '}
                <span className="text-slate-400 font-normal">(e.g., nurse, doctor, medical student, pharmacist)</span>
              </label>
              <input
                type="text"
                value={answers.medicalRole}
                onChange={e => set('medicalRole', e.target.value)}
                placeholder="Your role in healthcare..."
                className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          )}

          {/* Terminology familiarity — Likert */}
          <div className="card p-5 space-y-4">
            <LikertScale
              id="terminologyFamiliarity"
              question="How familiar are you with medical terminology?"
              value={answers.terminologyFamiliarity || null}
              lowLabel="Not at all familiar"
              highLabel="Very familiar"
              onChange={v => set('terminologyFamiliarity', v)}
            />
          </div>

          {/* Reading frequency */}
          {METADATA_FIELDS.slice(4).map(field => (
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
                      onChange={() => set(field.id as keyof UserMetadata, opt.value)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <button type="submit" className="btn-primary">
              Next: Read the Report →
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
