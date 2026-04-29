'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSurveyStore } from '@/lib/store'

const STEPS_UI = [
  'Analyzing your background and preferences...',
  'Reviewing your comprehension responses...',
  'Identifying terminology to simplify...',
  'Rewriting the report for your reading level and structure preference...',
  'Generating comprehension questions...',
  'Finalizing your personalized version...',
]

export default function ProcessingPage() {
  const router = useRouter()
  const { state, update, loaded } = useSurveyStore()
  const [stepIdx, setStepIdx] = useState(0)
  const [failed, setFailed] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const called = useRef(false)

  useEffect(() => {
    if (!loaded) return
    if (!state.metadata || !state.preSurvey) {
      router.replace('/survey/metadata')
      return
    }
    if (called.current) return
    called.current = true

    const interval = setInterval(() => {
      setStepIdx(i => Math.min(i + 1, STEPS_UI.length - 1))
    }, 2200)

    async function callLLM() {
      try {
        const res = await fetch('/api/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metadata: state.metadata,
            preSurvey: state.preSurvey,
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`)
        }

        const data = await res.json() as { rewrite: string; questions: unknown[]; prompt: string }
        update({
          llmRewrite: data.rewrite,
          llmPrompt: data.prompt,
          dynamicMCQs: data.questions as import('@/lib/types').DynamicMCQ[],
          currentStep: 4,
        })
        clearInterval(interval)
        router.push('/survey/personalized-report')
      } catch (err) {
        console.error(err)
        clearInterval(interval)
        setErrMsg(err instanceof Error ? err.message : 'Unknown error')
        setFailed(true)
      }
    }

    callLLM()
    return () => clearInterval(interval)
  }, [loaded]) // eslint-disable-line react-hooks/exhaustive-deps

  if (failed) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
        <p className="text-slate-500">We couldn&apos;t generate your personalized report. This may be a temporary issue.</p>
        {errMsg && <p className="text-xs text-red-400 font-mono bg-red-50 rounded px-3 py-2">{errMsg}</p>}
        <button
          onClick={() => { called.current = false; setFailed(false); setErrMsg(''); setStepIdx(0) }}
          className="btn-primary"
        >
          Try Again
        </button>
        <button onClick={() => router.push('/survey/original-report')} className="btn-secondary block mx-auto mt-2">
          ← Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-8">
      <div className="flex justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-900">Personalizing Your Report</h2>
        <p className="text-slate-500 text-sm">Please don&apos;t close this tab. This takes about 20–40 seconds.</p>
      </div>

      <div className="space-y-3 text-left">
        {STEPS_UI.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 text-sm transition-all duration-500
              ${i < stepIdx ? 'text-green-600' : i === stepIdx ? 'text-blue-700 font-medium' : 'text-slate-300'}`}
          >
            <span className="flex-none w-4 text-center">
              {i < stepIdx ? '✓' : i === stepIdx ? '◦' : '·'}
            </span>
            {step}
          </div>
        ))}
      </div>
    </div>
  )
}
