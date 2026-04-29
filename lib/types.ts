export interface UserMetadata {
  ageGroup: string
  gender: string
  education: string
  medicalBackground: string        // 'yes' | 'no'
  medicalRole: string              // open text, conditional
  terminologyFamiliarity: number   // 1–5 Likert
  readingFrequency: string
}

export interface PreSurveyAnswers {
  understoodWhole: string          // 'yes' | 'no'
  unfamiliarTerms: string[]        // checked terminology values
  unfamiliarTermsOther: string     // free text "other" field
  quantitativeUnderstanding: number // 1–5
  findingRatings: Record<string, number> // findingId -> 1–5
  recommendationRating: number    // 1–5
  preferredStructure: string      // 'bullets' | 'paragraphs' | 'mixed'
  highlightPreferences: string    // open text, optional
}

export interface DynamicMCQ {
  question: string
  options: { value: string; label: string }[]
  correct: string
}

export interface PostSurveyAnswers {
  easeOfUnderstanding: number     // 1–5
  detailMatch: number             // 1–5
  structureMatch: number          // 1–5
  versionPreference: string       // preference scale value
  mcqAnswers: Record<string, string> // question index -> chosen option value
  openComments: string
}

export interface SurveyState {
  participantId: string
  startedAt: string
  currentStep: number
  metadata: UserMetadata | null
  preSurvey: PreSurveyAnswers | null
  llmRewrite: string | null
  llmPrompt: string | null
  dynamicMCQs: DynamicMCQ[] | null
  postSurvey: PostSurveyAnswers | null
  completedAt: string | null
}

export interface SurveyRecord {
  participant_id: string
  created_at?: string
  updated_at?: string
  metadata: UserMetadata
  pre_survey: PreSurveyAnswers
  llm_prompt: string
  llm_rewrite: string
  dynamic_mcqs: DynamicMCQ[]
  post_survey: PostSurveyAnswers
  completed: boolean
}
