'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import type { UserMetadata, PreSurveyAnswers, PostSurveyAnswers, DynamicMCQ } from '@/lib/types'

interface AdminRecord {
  id: string
  created_at: string
  participant_id: string
  metadata: UserMetadata
  pre_survey: PreSurveyAnswers
  dynamic_mcqs: DynamicMCQ[]
  post_survey: PostSurveyAnswers
  completed: boolean
}

function avg(values: number[]) {
  if (!values.length) return '—'
  return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
}

function pct(num: number, den: number) {
  if (!den) return '—'
  return `${Math.round((num / den) * 100)}%`
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
      'age_group', 'gender', 'education', 'medical_background', 'medical_role',
      'terminology_familiarity', 'reading_frequency',
      'understood_whole', 'unfamiliar_terms_count', 'quantitative_understanding',
      'avg_finding_rating', 'recommendation_rating', 'preferred_structure',
      'ease_of_understanding', 'detail_match', 'structure_match', 'version_preference',
      'mcq_score_out_of_5',
    ]
    const csvRows = rows.map(r => {
      const pre = r.pre_survey
      const post = r.post_survey
      const findingValues = pre?.findingRatings ? Object.values(pre.findingRatings) : []
      const avgFinding = findingValues.length
        ? (findingValues.reduce((a, b) => a + b, 0) / findingValues.length).toFixed(2)
        : ''
      const mcqResult = post?.mcqAnswers && r.dynamic_mcqs ? mcqScore(post.mcqAnswers, r.dynamic_mcqs) : ''
      return [
        r.participant_id, r.created_at, r.completed,
        r.metadata?.ageGroup, r.metadata?.gender, r.metadata?.education,
        r.metadata?.medicalBackground, r.metadata?.medicalRole,
        r.metadata?.terminologyFamiliarity, r.metadata?.readingFrequency,
        pre?.understoodWhole, pre?.unfamiliarTerms?.length ?? '',
        pre?.quantitativeUnderstanding, avgFinding, pre?.recommendationRating, pre?.preferredStructure,
        post?.easeOfUnderstanding, post?.detailMatch, post?.structureMatch, post?.versionPreference,
        mcqResult,
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

  const easeScores = completed.map(r => r.post_survey?.easeOfUnderstanding).filter(Boolean) as number[]
  const detailScores = completed.map(r => r.post_survey?.detailMatch).filter(Boolean) as number[]
  const structureScores = completed.map(r => r.post_survey?.structureMatch).filter(Boolean) as number[]
  const mcqScores = completed
    .map(r => mcqScore(r.post_survey?.mcqAnswers, r.dynamic_mcqs))
    .filter(v => v !== null) as number[]

  const preferRewrite = completed.filter(r =>
    ['strongly-prefer-rewrite', 'prefer-rewrite'].includes(r.post_survey?.versionPreference ?? '')
  ).length
  const understoodWhole = completed.filter(r => r.pre_survey?.understoodWhole === 'yes').length

  // Terminology: count how many participants marked each term
  const termCounts: Record<string, number> = {}
  completed.forEach(r => {
    (r.pre_survey?.unfamiliarTerms ?? []).forEach(t => {
      termCounts[t] = (termCounts[t] ?? 0) + 1
    })
  })
  const topTerms = Object.entries(termCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

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

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Responses', value: rows.length },
          { label: 'Completed', value: `${completed.length} (${pct(completed.length, rows.length)})` },
          { label: 'Prefer Rewrite', value: completed.length ? `${preferRewrite} (${pct(preferRewrite, completed.length)})` : '—' },
          { label: 'Understood Original', value: completed.length ? `${understoodWhole} (${pct(understoodWhole, completed.length)})` : '—' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Post-survey score averages */}
      {completed.length > 0 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">Post-Rewrite Average Scores (1–5)</h2>
          {[
            { label: 'Ease of Understanding', scores: easeScores },
            { label: 'Detail Match', scores: detailScores },
            { label: 'Structure Match', scores: structureScores },
            { label: 'Comprehension Quiz Score (out of 5)', scores: mcqScores, max: 5 },
          ].map(row => (
            <div key={row.label} className="space-y-1">
              <div className="flex justify-between text-sm text-slate-600">
                <span>{row.label}</span>
                <span className="font-medium text-blue-700">{avg(row.scores)} {row.max ? '' : '/ 5'}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(Number(avg(row.scores)) / (row.max ?? 5)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Most confusing terminology */}
      {topTerms.length > 0 && (
        <div className="card p-6 space-y-3">
          <h2 className="font-semibold text-slate-800">Most Frequently Flagged Unfamiliar Terms</h2>
          <div className="space-y-2">
            {topTerms.map(([term, count]) => (
              <div key={term} className="flex items-center gap-3 text-sm">
                <span className="text-slate-600 w-48 capitalize">{term.replace(/_/g, ' ')}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${(count / completed.length) * 100}%` }}
                  />
                </div>
                <span className="text-slate-500 w-20 text-right">{count} ({pct(count, completed.length)})</span>
              </div>
            ))}
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
                <th className="px-3 py-2 font-medium">Term. Fam.</th>
                <th className="px-3 py-2 font-medium">Understood</th>
                <th className="px-3 py-2 font-medium">Unfamiliar #</th>
                <th className="px-3 py-2 font-medium">Ease</th>
                <th className="px-3 py-2 font-medium">Detail</th>
                <th className="px-3 py-2 font-medium">Structure</th>
                <th className="px-3 py-2 font-medium">MCQ /5</th>
                <th className="px-3 py-2 font-medium">Preference</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const score = r.post_survey?.mcqAnswers && r.dynamic_mcqs
                  ? mcqScore(r.post_survey.mcqAnswers, r.dynamic_mcqs)
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
                    <td className="px-3 py-2 text-center">{r.metadata?.terminologyFamiliarity ?? '—'}</td>
                    <td className="px-3 py-2 text-center">{r.pre_survey?.understoodWhole ?? '—'}</td>
                    <td className="px-3 py-2 text-center">{r.pre_survey?.unfamiliarTerms?.length ?? '—'}</td>
                    <td className="px-3 py-2 text-center font-medium text-blue-600">{r.post_survey?.easeOfUnderstanding ?? '—'}</td>
                    <td className="px-3 py-2 text-center">{r.post_survey?.detailMatch ?? '—'}</td>
                    <td className="px-3 py-2 text-center">{r.post_survey?.structureMatch ?? '—'}</td>
                    <td className="px-3 py-2 text-center">{score !== null ? score : '—'}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">{r.post_survey?.versionPreference?.replace(/-/g, ' ') ?? '—'}</td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr><td colSpan={13} className="px-4 py-8 text-center text-slate-400">No responses yet.</td></tr>
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
