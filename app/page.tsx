'use client'

import { useRouter } from 'next/navigation'
import { useSurveyStore } from '@/lib/store'

export default function LandingPage() {
  const router = useRouter()
  const { loaded, reset } = useSurveyStore()

  function handleStart() {
    reset()
    router.push('/survey/metadata')
  }

  if (!loaded) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full border border-blue-200">
          CS568 Research Study · UIUC 2026
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
          Note-Worthy
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          Adaptive, Personalized Interfaces for Medical Text Understanding
        </p>
      </div>

      {/* What is this */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">About This Study</h2>
        <p className="text-slate-600 leading-relaxed">
          Medical reports are written for clinicians — not patients. This study explores whether
          an AI-powered system can rewrite medical documents in a way that is meaningfully more
          understandable and useful to <strong>you specifically</strong>, based on your background
          and preferences.
        </p>
        <p className="text-slate-600 leading-relaxed">
          You will read a real-format medical consultation note, tell us how well you understood it,
          and then receive a version personalized by an AI to match your reading preferences.
          We&apos;ll ask you to compare both.
        </p>
      </div>

      {/* Study flow */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">What to Expect</h2>
        <ol className="space-y-3">
          {[
            ['About You', 'A few quick questions about your background and reading preferences (2 min)'],
            ['Original Report', 'Read a medical consultation note and answer comprehension questions (5 min)'],
            ['Personalized Report', 'Read an AI-personalized version of the same report and compare (5 min)'],
            ['Complete', 'That\'s it! Estimated total time: 10–15 minutes'],
          ].map(([title, desc], i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-none w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex items-center justify-center">
                {i + 1}
              </span>
              <div>
                <span className="font-medium text-slate-800">{title}</span>
                <span className="text-slate-500"> — {desc}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Consent */}
      <div className="card p-6 space-y-3 border-amber-200 bg-amber-50">
        <h2 className="text-lg font-semibold text-slate-900">Consent & Privacy</h2>
        <ul className="space-y-1.5 text-sm text-slate-600">
          <li className="flex gap-2"><span className="text-green-600 font-bold">✓</span> Participation is entirely voluntary and anonymous.</li>
          <li className="flex gap-2"><span className="text-green-600 font-bold">✓</span> No personally identifiable information is collected.</li>
          <li className="flex gap-2"><span className="text-green-600 font-bold">✓</span> Responses are used only for academic research.</li>
          <li className="flex gap-2"><span className="text-green-600 font-bold">✓</span> The medical report describes a fictional patient.</li>
          <li className="flex gap-2"><span className="text-green-600 font-bold">✓</span> You may stop at any time without consequence.</li>
        </ul>
        <p className="text-xs text-slate-500 pt-1">
          By clicking &ldquo;Start Survey&rdquo; you acknowledge that you have read this information
          and consent to participate in this research study.
        </p>
      </div>

      <div className="text-center">
        <button onClick={handleStart} className="btn-primary text-base px-10 py-4">
          Start Survey →
        </button>
      </div>
    </div>
  )
}
