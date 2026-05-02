import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { buildPersonalizationPrompt, buildGenericPrompt } from '@/lib/prompt'
import type { UserMetadata, DynamicMCQ } from '@/lib/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface LLMResponse {
  rewrite: string
  questions: DynamicMCQ[]
}

function parseResponse(text: string): LLMResponse {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
  const parsed = JSON.parse(cleaned) as LLMResponse
  if (typeof parsed.rewrite !== 'string' || !Array.isArray(parsed.questions)) {
    throw new Error('LLM response missing required fields')
  }
  return parsed
}

async function callLLM(prompt: string): Promise<LLMResponse> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 6000,
    messages: [{ role: 'user', content: prompt }],
  })
  const rawText = message.content
    .filter(b => b.type === 'text')
    .map(b => (b as { type: 'text'; text: string }).text)
    .join('')
  return parseResponse(rawText)
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as { metadata: UserMetadata }
    const { metadata } = body

    if (!metadata) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const personalizedPrompt = buildPersonalizationPrompt(metadata)
    const genericPrompt = buildGenericPrompt()

    const [personalized, generic] = await Promise.all([
      callLLM(personalizedPrompt),
      callLLM(genericPrompt),
    ])

    return NextResponse.json({
      personalizedRewrite: personalized.rewrite,
      genericRewrite: generic.rewrite,
      dynamicMCQs: personalized.questions,
      prompt: personalizedPrompt,
    })
  } catch (err) {
    console.error('[/api/rewrite]', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
