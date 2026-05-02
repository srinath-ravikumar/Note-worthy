import type { UserMetadata } from './types'
import { MEDICAL_REPORT_TEXT } from '@/data/medical-report'

function termScore(termFamiliarity: Record<string, boolean>): number {
  return Object.values(termFamiliarity).filter(Boolean).length
}

function jargonInstruction(metadata: UserMetadata): string {
  if (metadata.medicalBackground === 'working') {
    return 'The reader works in healthcare. You may use standard medical terminology but explain clinical implications clearly.'
  }
  if (metadata.medicalBackground === 'some-coursework') {
    return 'The reader has some medical coursework. Use moderate medical vocabulary with brief plain-language explanations for specialized terms.'
  }
  const score = termScore(metadata.termFamiliarity)
  if (score <= 2) return 'Replace ALL medical jargon with everyday words. When a term is unavoidable, define it immediately in parentheses. Aim for a 6th-grade reading level.'
  if (score <= 4) return 'Use mostly plain language. Briefly define any medical term you use. Keep sentences short.'
  if (score <= 6) return 'Balance plain language with some medical vocabulary. Always explain what each finding means for the patient\'s day-to-day life.'
  return 'You may use standard medical terminology. Focus on clinical completeness and actionable interpretation.'
}

function structureInstruction(structure: string): string {
  switch (structure) {
    case 'bullets':
      return 'Use bullet points throughout. Concise bullets under plain-language headers. Avoid long paragraphs.'
    case 'paragraphs':
      return 'Write in short, readable paragraphs. One idea per paragraph. Use plain-language section headers.'
    case 'mixed':
    default:
      return 'Use a mixed format: plain-language section headers, 1–2 short sentences of context, then bullet points for key facts and action items.'
  }
}

function purposeInstruction(purpose: string, chronicCondition: string): string {
  const lines: string[] = []
  if (purpose === 'myself') lines.push('The reader is reading this for their own health — emphasize personal implications and what actions they should take.')
  if (purpose === 'family') lines.push('The reader is managing a family member\'s care — explain findings in a way that helps a caregiver understand and communicate with doctors.')
  if (purpose === 'work') lines.push('The reader engages with medical documents professionally — they want clarity and completeness over heavy simplification.')
  if (chronicCondition === 'yes') lines.push('The reader or a close family member has managed a chronic condition — they likely understand the long-term nature of health management.')
  return lines.join(' ')
}

export function buildPersonalizationPrompt(metadata: UserMetadata): string {
  const score = termScore(metadata.termFamiliarity)
  return `You are a medical document accessibility specialist. Rewrite the following echocardiogram report so it is more understandable and useful for this specific reader. Then generate 5 comprehension questions.

## READER PROFILE
- Age group: ${metadata.ageGroup}
- Education: ${metadata.education}
- English first language: ${metadata.englishFirstLanguage}
- Medical background: ${metadata.medicalBackground}
- Reading frequency: ${metadata.readingFrequency}
- Has managed chronic condition: ${metadata.chronicCondition}
- Medical term familiarity score: ${score}/8 (number of standard terms they recognise)
- Reading purpose: ${metadata.readingPurpose}

## PERSONALIZATION INSTRUCTIONS

**Terminology:** ${jargonInstruction(metadata)}

**Structure:** ${structureInstruction(metadata.preferredStructure)}

**Context:** ${purposeInstruction(metadata.readingPurpose, metadata.chronicCondition)}

**Required sections (use these plain-language headers):**
1. "What This Report Is About" — 2–3 sentences only.
2. "Key Measurements" — one bullet per measurement: **Name (value)** — one sentence on what it means and whether it is normal.
3. "What We Found" — one short paragraph (3–5 sentences) per finding. Name it, state severity, give one plain-language explanation.
4. "What This Means for You" — 3–5 bullets summarising the combined picture.
5. "What Should Happen Next" — numbered list, one sentence per action item.
6. "Warning Signs" — a single short bulleted list of symptoms requiring urgent care.

**Critical constraints:**
- Keep the entire rewrite under 600 words.
- Do not omit any finding or recommendation.
- Do not add information not in the original.
- Maintain medical accuracy throughout.

## ORIGINAL REPORT
${MEDICAL_REPORT_TEXT}

## COMPREHENSION QUESTIONS
After the rewrite, generate exactly 5 multiple-choice questions testing factual comprehension of the rewritten version. Each question must have 4 options (a, b, c, d) with exactly one correct answer.

## OUTPUT FORMAT
Return a single valid JSON object with no text outside it:

{
  "rewrite": "<full rewritten report as a markdown string>",
  "questions": [
    {
      "question": "<question text>",
      "options": [
        {"value": "a", "label": "<option A>"},
        {"value": "b", "label": "<option B>"},
        {"value": "c", "label": "<option C>"},
        {"value": "d", "label": "<option D>"}
      ],
      "correct": "<correct option value>"
    }
  ]
}`
}

export function buildGenericPrompt(): string {
  return `Rewrite the following echocardiogram report for a general audience at an 8th grade reading level.

Instructions:
- Use plain, everyday language. Replace all medical jargon.
- Keep it concise — under 500 words total.
- Structure: 2-sentence summary, key measurements as short bullets, findings as brief paragraphs, next steps as a numbered list, warning signs as bullets.
- Do NOT personalize for any specific reader — this version should work for anyone.
- Maintain medical accuracy. Do not omit any finding or recommendation.

## ORIGINAL REPORT
${MEDICAL_REPORT_TEXT}

## OUTPUT FORMAT
Return a single valid JSON object with no text outside it:
{"rewrite": "<full rewritten report as a markdown string>", "questions": []}`
}
