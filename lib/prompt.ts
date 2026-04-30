import type { UserMetadata, PreSurveyAnswers } from './types'
import { FINDING_LABELS } from '@/data/questions'
import { MEDICAL_REPORT_TEXT } from '@/data/medical-report'

function jargonInstruction(familiarity: number, background: string, role: string): string {
  if (background === 'yes' && role) {
    return `The reader is a healthcare professional (${role}). You may use standard medical terminology but still explain clinical implications in plain language — they may be familiar with terms but not necessarily with cardiology sub-specialties.`
  }
  if (familiarity <= 1) return 'Replace ALL medical jargon with everyday words. When a medical term is unavoidable, define it immediately in plain language in parentheses. Aim for a 6th-grade reading level.'
  if (familiarity === 2) return 'Use mostly plain language. Briefly define any medical term you use. Keep sentences short.'
  if (familiarity === 3) return 'Balance plain language with some medical vocabulary. Always explain what technical findings mean for the patient\'s health in practical terms.'
  if (familiarity === 4) return 'You may use standard medical terminology, but always follow each finding with a plain-language interpretation of its significance.'
  return 'You may use precise medical terminology. Focus on clinical completeness and actionable interpretation rather than simplification.'
}

function structureInstruction(structure: string): string {
  switch (structure) {
    case 'bullets':
      return 'Use bullet points throughout. Organize each section with a plain-language header followed by concise bullet points. Avoid long paragraphs.'
    case 'paragraphs':
      return 'Write in short, readable paragraphs. Each paragraph should cover one idea. Use plain-language section headers.'
    case 'mixed':
    default:
      return 'Use a mixed format: plain-language section headers, 1–2 short sentences of context, then bullet points for key facts and action items.'
  }
}

function understandingContext(preSurvey: PreSurveyAnswers): string {
  const lines: string[] = []

  if (preSurvey.understoodWhole === 'no') {
    lines.push('The reader reported they could NOT understand the overall document — prioritize radical simplification.')
  }

  const lowFindings = FINDING_LABELS.filter(f => {
    const rating = preSurvey.findingRatings[f.id]
    return rating && rating <= 2
  })
  if (lowFindings.length > 0) {
    lines.push(`The reader had particular difficulty with: ${lowFindings.map(f => f.label).join(', ')}. Pay extra attention to explaining these sections clearly.`)
  }

  if (preSurvey.recommendationRating <= 2) {
    lines.push('The reader poorly understood the Recommendations section — make the action steps especially clear and actionable.')
  }

  if (preSurvey.quantitativeUnderstanding <= 2) {
    lines.push('The reader found the quantitative measurements confusing — explain each number in context (what it measures, what the normal range is, and whether this patient\'s value is concerning).')
  }

  if (preSurvey.unfamiliarTerms.length > 0) {
    lines.push(`The reader specifically flagged these terms as unfamiliar: ${preSurvey.unfamiliarTerms.join(', ')}${preSurvey.unfamiliarTermsOther ? `, ${preSurvey.unfamiliarTermsOther}` : ''}. Ensure each is either replaced or clearly defined.`)
  }

  if (preSurvey.highlightPreferences.trim()) {
    lines.push(`The reader wants this specifically highlighted in medical documents: "${preSurvey.highlightPreferences}".`)
  }

  return lines.length > 0 ? lines.join('\n') : 'The reader had moderate overall comprehension of the original.'
}

export function buildPersonalizationPrompt(
  metadata: UserMetadata,
  preSurvey: PreSurveyAnswers
): string {
  return `You are a medical document accessibility specialist. Rewrite the following echocardiogram report so it is significantly more understandable and useful for this specific reader. Then generate 5 comprehension questions.

## READER PROFILE
- Age group: ${metadata.ageGroup}
- Gender: ${metadata.gender}
- Education: ${metadata.education}
- Medical/healthcare background: ${metadata.medicalBackground === 'yes' ? `Yes — ${metadata.medicalRole || 'healthcare professional'}` : 'No'}
- Self-rated medical terminology familiarity (1 = none, 5 = very familiar): ${metadata.terminologyFamiliarity}/5
- How often they read medical documents: ${metadata.readingFrequency}

## WHAT THE READER STRUGGLED WITH
${understandingContext(preSurvey)}

## PERSONALIZATION INSTRUCTIONS

**Terminology:** ${jargonInstruction(metadata.terminologyFamiliarity, metadata.medicalBackground, metadata.medicalRole)}

**Structure:** ${structureInstruction(preSurvey.preferredStructure)}

**Required sections (use these plain-language headers):**
1. "What This Report Is About" — 2–3 sentences only. Why the test was done and the one-line overall conclusion.
2. "Key Measurements" — one bullet per measurement. Format: **Name (value)** — one sentence on what it means and whether it is normal. No lengthy explanations.
3. "What We Found" — one short paragraph (3–5 sentences max) per finding. Name the finding, state whether it is mild/moderate/severe, and give one plain-language explanation of what it means for the patient. Do not repeat measurement values already listed above.
4. "What This Means for You" — 3–5 bullet points summarising the combined picture. Be direct.
5. "What Should Happen Next" — numbered list, one sentence per action item. No sub-bullets or lengthy explanations.
6. "Warning Signs" — a single short bulleted list of symptoms to watch for. No sub-sections.

**Critical constraints:**
- Keep the entire rewrite under 600 words.
- Do not omit any finding or recommendation from the original report.
- Do not add information not present in the original.
- Do not minimize serious findings — be clear but not unnecessarily alarming.
- Maintain medical accuracy throughout.

## ORIGINAL REPORT
${MEDICAL_REPORT_TEXT}

## COMPREHENSION QUESTIONS
After the rewrite, generate exactly 5 multiple-choice questions that test factual comprehension of the REWRITTEN version. Questions should cover different aspects: findings, measurements, recommendations, and significance. Each question must have 4 options (a, b, c, d) with exactly one correct answer. Make questions answerable from the rewritten text — do not use clinical knowledge not present in the rewrite.

## OUTPUT FORMAT
Return your entire response as a single valid JSON object with exactly this structure. Do not include any text outside the JSON:

{
  "rewrite": "<the full rewritten report as a string>",
  "questions": [
    {
      "question": "<question text>",
      "options": [
        {"value": "a", "label": "<option A text>"},
        {"value": "b", "label": "<option B text>"},
        {"value": "c", "label": "<option C text>"},
        {"value": "d", "label": "<option D text>"}
      ],
      "correct": "<value of the correct option, e.g. 'b'>"
    }
  ]
}`
}
