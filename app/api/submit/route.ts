import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { participantId, startedAt, metadata, preSurvey, llmPrompt, llmRewrite, dynamicMCQs, postSurvey } = body

    if (!participantId || !metadata || !preSurvey || !postSurvey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getAdminClient()

    const { error } = await supabase.from('survey_responses').upsert(
      {
        participant_id: participantId,
        started_at: startedAt,
        metadata,
        pre_survey: preSurvey,
        llm_prompt: llmPrompt,
        llm_rewrite: llmRewrite,
        dynamic_mcqs: dynamicMCQs ?? [],
        post_survey: postSurvey,
        completed: true,
      },
      { onConflict: 'participant_id' }
    )

    if (error) {
      console.error('[/api/submit] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/submit]', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
