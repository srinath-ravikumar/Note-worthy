'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import type { UserMetadata, VersionRating, FinalComparison, DynamicMCQ } from '@/lib/types'

interface AdminRecord {
  id: string
  created_at: string
  participant_id: string
  metadata: UserMetadata
  version_order: string[]
  version_ratings: Record<string, VersionRating>
  final_comparison: FinalComparison
  dynamic_mcqs: DynamicMCQ[]
  completed: boolean
}

const VERSION_LABELS: Record<string, string> = {
  original: 'Original',
  generic: 'Plain Language',
  personalized: 'Personalized',
}

const RATING_KEYS: (keyof VersionRating)[] = [
  'understood', 'languageClear', 'detailRight', 'feltPersonalized', 'wouldPrefer',
]

const RATING_SHORT: Record<string, string> = {
  understood: 'Understood',
  languageClear: 'Clear Language',
  detailRight: 'Detail Right',
  feltPersonalized: 'Felt Personal',
  wouldPrefer: 'Would Prefer',
}

function avg(values: number[]) {
  if (!values.length) return '—'
  return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
}

function pct(num: number, den: number) {
  if (!den) return '—'
  return `${Math.round((num / den) * 100)}%`
}

function termScore(termFamiliarity: Record<string, boolean> = {}): number {
  return Object.values(termFamiliarity).filter(Boolean).length
}

function mcqScore(answers: Record<string, string>, mcqs: DynamicMCQ[]): number | null {
  if (!answers || !mcqs?.length) return null
  return mcqs.reduce((score, q, i) => score + (answers[i] === q.correct ? 1 : 0), 0)
}

function AdminDashboard() {
  const params = useSearchParams()
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [rows, setRows] = useState<AdminRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (pw: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/data?password=${encodeURIComponent(pw)}`)
      if (!res.ok) {
        const e = await res.json()
        throw new Error((e as { error?: string }).error ?? `HTTP ${res.status}`)
      }
      const data = await res.json() as { rows: AdminRecord[] }
      setRows(data.rows)
      setAuthed(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const pw = params.get('password')
    if (pw) { setPassword(pw); load(pw) }
  }, [params, load])

  function downloadCSV() {
    if (!rows.length) return
    const headers = [
      'participant_id', 'created_at', 'completed',
      'age_group', 'education', 'english_first_language', 'medical_background',
      'reading_frequency', 'chronic_condition', 'term_familiarity_score', 'reading_purpose',
      'version_order',
      'original_understood', 'original_language_clear', 'original_detail_right', 'original_felt_personal', 'original_would_prefer',
      'generic_understood', 'generic_language_clear', 'generic_detail_right', 'generic_felt_personal', 'generic_would_prefer',
      'personalized_understood', 'personalized_language_clear', 'personalized_detail_right', 'personalized_felt_personal', 'personalized_would_prefer',
      'mcq_score', 'ranking_1st', 'ranking_2nd', 'ranking_3rd', 'comments',
    ]
    const csvRows = rows.map(r => {
      const m = r.metadata ?? {}
      const vr = r.version_ratings ?? {}
      const fc = r.final_comparison ?? {}
      const score = vr['personalized']?.mcqAnswers && r.dynamic_mcqs
        ? mcqScore(vr['personalized'].mcqAnswers, r.dynamic_mcqs)
        : ''
      return [
        r.participant_id, r.created_at, r.completed,
        m.ageGroup, m.education, m.englishFirstLanguage, m.medicalBackground,
        m.readingFrequency, m.chronicCondition, termScore(m.termFamiliarity), m.readingPurpose,
        (r.version_order ?? []).join('>'),
        vr['original']?.understood, vr['original']?.languageClear, vr['original']?.detailRight, vr['original']?.feltPersonalized, vr['original']?.wouldPrefer,
        vr['generic']?.understood, vr['generic']?.languageClear, vr['generic']?.detailRight, vr['generic']?.feltPersonalized, vr['generic']?.wouldPrefer,
        vr['personalized']?.understood, vr['personalized']?.languageClear, vr['personalized']?.detailRight, vr['personalized']?.feltPersonalized, vr['personalized']?.wouldPrefer,
        score, fc.ranking?.[0], fc.ranking?.[1], fc.ranking?.[2], fc.comments,
      ].map(v => `"${v ?? ''}"`).join(',')
    })
    const blob = new Blob([[headers.join(','), ...csvRows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'survey_responses.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-24 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <div className="card p-6 space-y-4">
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(password)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button onClick={() => load(password)} disabled={loading} className="btn-primary w-full">
            {loading ? 'Loading...' : 'Access Dashboard'}
          </button>
        </div>
        <p className="text-xs text-center text-slate-400">Or append <code>?password=...</code> to the URL</p>
      </div>
    )
  }

  const completed = rows.filter(r => r.completed)

  // Per-version average ratings
  const versionAvgs = (['original', 'generic', 'personalized'] as const).map(v => ({
    version: v,
    label: VERSION_LABELS[v],
    avgs: RATING_KEYS.map(k => {
      const vals = completed
        .map(r => r.version_ratings?.[v]?.[k] as number)
        .filter(n => typeof n === 'number' && n > 0)
      return { key: k, label: RATING_SHORT[k], avg: avg(vals) }
    }),
  }))

  // Ranking distribution
  const rankCounts: Record<string, Record<number, number>> = { original: {}, generic: {}, personalized: {} }
  completed.forEach(r => {
    (r.final_comparison?.ranking ?? []).forEach((v, i) => {
      if (rankCounts[v]) rankCounts[v][i + 1] = (rankCounts[v][i + 1] ?? 0) + 1
    })
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Note-Worthy — CS568 Survey Results</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => load(password)} className="btn-secondary text-sm py-2">Refresh</button>
          <button onClick={downloadCSV} className="btn-primary text-sm py-2">Download CSV</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Responses', value: rows.length },
          { label: 'Completed', value: `${completed.length} (${pct(completed.length, rows.length)})` },
          { label: 'Personalized Ranked 1st', value: completed.length ? pct(rankCounts['personalized'][1] ?? 0, completed.length) : '—' },
          { label: 'Generic Ranked 1st', value: completed.length ? pct(rankCounts['generic'][1] ?? 0, completed.length) : '—' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Per-version rating averages */}
      {completed.length > 0 && (
        <div className="card p-6 space-y-6">
          <h2 className="font-semibold text-slate-800">Average Ratings by Version (1–5)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {versionAvgs.map(({ label, avgs }) => (
              <div key={label} className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 border-b pb-1">{label}</h3>
                {avgs.map(({ key, label: rl, avg: a }) => (
                  <div key={key} className="space-y-0.5">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>{rl}</span>
                      <span className="font-medium text-blue-700">{a}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(Number(a) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ranking distribution */}
      {completed.length > 0 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">Version Ranking Distribution</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
              <thead>
                <tr className="text-xs text-slate-500 border-b">
                  <th className="py-2 text-left font-medium">Version</th>
                  <th className="py-2 font-medium">1st Choice</th>
                  <th className="py-2 font-medium">2nd Choice</th>
                  <th className="py-2 font-medium">3rd Choice</th>
                </tr>
              </thead>
              <tbody>
                {(['original', 'generic', 'personalized'] as const).map(v => (
                  <tr key={v} className="border-b">
                    <td className="py-2 text-left text-slate-700">{VERSION_LABELS[v]}</td>
                    {[1, 2, 3].map(rank => (
                      <td key={rank} className="py-2 text-slate-600">
                        {rankCounts[v][rank] ?? 0} ({pct(rankCounts[v][rank] ?? 0, completed.length)})
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Response table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b bg-slate-50">
          <h2 className="font-semibold text-slate-800">All Responses ({rows.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b bg-slate-50">
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Done</th>
                <th className="px-3 py-2 font-medium">Age</th>
                <th className="px-3 py-2 font-medium">Med. Bg.</th>
                <th className="px-3 py-2 font-medium">Term Score</th>
                <th className="px-3 py-2 font-medium">Orig. Understood</th>
                <th className="px-3 py-2 font-medium">Gen. Understood</th>
                <th className="px-3 py-2 font-medium">Pers. Understood</th>
                <th className="px-3 py-2 font-medium">MCQ /5</th>
                <th className="px-3 py-2 font-medium">1st Choice</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const vr = r.version_ratings ?? {}
                const score = vr['personalized']?.mcqAnswers && r.dynamic_mcqs
                  ? mcqScore(vr['personalized'].mcqAnswers, r.dynamic_mcqs)
                  : null
                return (
                  <tr key={r.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 font-mono text-xs text-slate-400">{r.participant_id?.slice(0, 8)}</td>
                    <td className="px-3 py-2 text-slate-500 text-xs whitespace-nowrap">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${r.completed ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {r.completed ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{r.metadata?.ageGroup ?? '—'}</td>
                    <td className="px-3 py-2 text-slate-600">{r.metadata?.medicalBackground ?? '—'}</td>
                    <td className="px-3 py-2 text-center">{termScore(r.metadata?.termFamiliarity)}/8</td>
                    <td className="px-3 py-2 text-center">{vr['original']?.understood ?? '—'}</td>
                    <td className="px-3 py-2 text-center">{vr['generic']?.understood ?? '—'}</td>
                    <td className="px-3 py-2 text-center font-medium text-blue-600">{vr['personalized']?.understood ?? '—'}</td>
                    <td className="px-3 py-2 text-center">{score !== null ? score : '—'}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      {VERSION_LABELS[r.final_comparison?.ranking?.[0] ?? ''] ?? '—'}
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-slate-400">No responses yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-slate-400">Loading...</div>}>
      <AdminDashboard />
    </Suspense>
  )
}
