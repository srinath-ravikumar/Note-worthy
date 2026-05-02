export interface UserMetadata {
  ageGroup: string
  education: string
  englishFirstLanguage: string
  medicalBackground: string        // 'none' | 'some-coursework' | 'working'
  readingFrequency: string         // 'rarely' | 'few-times-year' | 'monthly-plus'
  chronicCondition: string         // 'yes' | 'no'
  termFamiliarity: Record<string, boolean>  // term id -> knows it
  readingPurpose: string           // 'myself' | 'family' | 'work' | 'dont-read'
  preferredStructure: string       // 'bullets' | 'paragraphs' | 'mixed'
}

export interface DynamicMCQ {
  question: string
  options: { value: string; label: string }[]
  correct: string
}

export interface VersionRating {
  understood: number        // 1–5
  languageClear: number     // 1–5
  detailRight: number       // 1–5
  feltPersonalized: number  // 1–5
  wouldPrefer: number       // 1–5
  mcqAnswers: Record<string, string>  // only populated for personalized version
}

export interface FinalComparison {
  ranking: string[]   // e.g. ['personalized', 'original', 'generic'] — most to least preferred
  comments: string
}

export interface SurveyState {
  participantId: string
  startedAt: string
  currentStep: number
  metadata: UserMetadata | null
  genericRewrite: string | null
  personalizedRewrite: string | null
  llmPrompt: string | null
  dynamicMCQs: DynamicMCQ[] | null
  versionOrder: string[] | null        // randomized ['original','generic','personalized']
  currentVersionIndex: number          // 0, 1, or 2
  versionRatings: Record<string, VersionRating>
  finalComparison: FinalComparison | null
  completedAt: string | null
}

export interface SurveyRecord {
  participant_id: string
  created_at?: string
  updated_at?: string
  metadata: UserMetadata
  generic_rewrite: string
  personalized_rewrite: string
  llm_prompt: string
  dynamic_mcqs: DynamicMCQ[]
  version_order: string[]
  version_ratings: Record<string, VersionRating>
  final_comparison: FinalComparison
  completed: boolean
}
