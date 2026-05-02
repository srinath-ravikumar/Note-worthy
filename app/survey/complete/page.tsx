'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSurveyStore } from '@/lib/store'

export default function CompletePage() {
  const { state } = useSurveyStore()

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.removeItem('cs568_survey_v2')
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-8">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl">
          ✓
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900">Thank You!</h1>
        <p className="text-slate-600 text-lg leading-relaxed">
          Your response has been recorded. You have completed the Note-Worthy study.
        </p>
      </div>

      <div className="card p-6 text-left space-y-3">
        <h2 className="font-semibold text-slate-800">What happens next?</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            Your anonymous responses will be aggregated with other participants.
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            We&apos;ll analyze which reader signals most predict satisfaction with personalized rewrites versus generic ones.
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            Findings will be published as part of the CS568 course project at UIUC.
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            As future work, we plan to use preference-response pairs to fine-tune models for personalized medical document adaptation.
          </li>
        </ul>
      </div>

      {state.participantId && (
        <p className="text-xs text-slate-400">
          Participant ID: <code className="font-mono">{state.participantId.slice(0, 8)}...</code>
        </p>
      )}

      <div className="pt-4">
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          ← Return to home
        </Link>
      </div>
    </div>
  )
}
