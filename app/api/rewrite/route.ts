import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { buildPersonalizationPrompt } from '@/lib/prompt'
import type { UserMetadata, PreSurveyAnswers, DynamicMCQ } from '@/lib/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface LLMResponse {
  rewrite: string
  questions: DynamicMCQ[]
}

function parseResponse(text: string): LLMResponse {
  // Strip markdown code fences if Claude wraps in ```json ... ```
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
  const parsed = JSON.parse(cleaned) as LLMResponse
  if (typeof parsed.rewrite !== 'string' || !Array.isArray(parsed.questions)) {
    throw new Error('LLM response missing required fields')
  }
  return parsed
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as { metadata: UserMetadata; preSurvey: PreSurveyAnswers }
    const { metadata, preSurvey } = body

    if (!metadata || !preSurvey) {
      return NextResponse.json({ error: 'Missing metadata or preSurvey' }, { status: 400 })
    }

    const prompt = buildPersonalizationPrompt(metadata, preSurvey)

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')

    const { rewrite, questions } = parseResponse(rawText)

    return NextResponse.json({ rewrite, questions, prompt })
  } catch (err) {
    console.error('[/api/rewrite]', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
