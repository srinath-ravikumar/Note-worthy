// ─── PART A — READER PROFILE ──────────────────────────────────────────────────

export interface MetadataField {
  id: string
  label: string
  type: 'radio'
  options: { value: string; label: string }[]
  required: boolean
}

export const METADATA_FIELDS: MetadataField[] = [
  {
    id: 'ageGroup',
    label: 'What is your age range?',
    type: 'radio',
    options: [
      { value: '18-24', label: '18–24' },
      { value: '25-34', label: '25–34' },
      { value: '35-44', label: '35–44' },
      { value: '45-54', label: '45–54' },
      { value: '55+', label: '55+' },
    ],
    required: true,
  },
  {
    id: 'education',
    label: 'What is your highest level of education?',
    type: 'radio',
    options: [
      { value: 'high-school', label: 'High school' },
      { value: 'some-college', label: 'Some college' },
      { value: 'bachelors', label: "Bachelor's" },
      { value: 'masters-plus', label: "Master's or higher" },
    ],
    required: true,
  },
  {
    id: 'englishFirstLanguage',
    label: 'Is English your first language?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
    required: true,
  },
  {
    id: 'medicalBackground',
    label: 'Do you have any professional medical training or experience?',
    type: 'radio',
    options: [
      { value: 'none', label: 'None' },
      { value: 'some-coursework', label: 'Some coursework' },
      { value: 'working', label: 'Working in healthcare' },
    ],
    required: true,
  },
  {
    id: 'readingFrequency',
    label: 'How often do you read medical documents (lab results, discharge summaries, prescriptions)?',
    type: 'radio',
    options: [
      { value: 'rarely', label: 'Rarely' },
      { value: 'few-times-year', label: 'A few times a year' },
      { value: 'monthly-plus', label: 'Monthly or more' },
    ],
    required: true,
  },
  {
    id: 'chronicCondition',
    label: 'Have you or a close family member managed a chronic health condition?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
    required: true,
  },
  {
    id: 'readingPurpose',
    label: 'When you read medical documents, it\'s usually:',
    type: 'radio',
    options: [
      { value: 'myself', label: 'For my own health' },
      { value: 'family', label: 'For a family member\'s care' },
      { value: 'work', label: 'For work or study' },
      { value: 'dont-read', label: 'I don\'t typically read them' },
    ],
    required: true,
  },
  {
    id: 'preferredStructure',
    label: 'Which format do you prefer for medical information?',
    type: 'radio',
    options: [
      { value: 'bullets', label: 'Bullet points — concise, scannable' },
      { value: 'paragraphs', label: 'Short paragraphs — more explanatory' },
      { value: 'mixed', label: 'Mixed — headers with bullets and brief explanations' },
    ],
    required: true,
  },
]

// ─── TERM FAMILIARITY TEST ────────────────────────────────────────────────────
// Participants select which terms they recognise (objective score vs. self-report)

export const TERM_FAMILIARITY_TERMS = [
  { id: 'hypertension', label: 'Hypertension' },
  { id: 'bilateral-infiltrates', label: 'Bilateral infiltrates' },
  { id: 'benign', label: 'Benign' },
  { id: 'prognosis', label: 'Prognosis' },
  { id: 'edema', label: 'Edema' },
  { id: 'myocardial-infarction', label: 'Myocardial infarction' },
  { id: 'cbc-panel', label: 'CBC panel' },
  { id: 'contraindicated', label: 'Contraindicated' },
]

// ─── PART B — PER-VERSION RATING QUESTIONS ────────────────────────────────────

export const PART_B_QUESTIONS = [
  { id: 'understood',       label: 'I understood the main findings of this document.' },
  { id: 'languageClear',   label: 'The language used was clear to me.' },
  { id: 'detailRight',     label: 'The level of detail felt right — not too much, not too little.' },
  { id: 'feltPersonalized', label: 'The document felt like it was written for someone like me.' },
  { id: 'wouldPrefer',     label: 'I would prefer to receive medical information in this format.' },
]

// ─── FINDING LABELS (used in prompt for section context) ─────────────────────

export const FINDING_LABELS = [
  { id: 'f1', label: 'Finding 1: Left Ventricular Systolic Dysfunction' },
  { id: 'f2', label: 'Finding 2: Diastolic Dysfunction — Grade II' },
  { id: 'f3', label: 'Finding 3: Moderate Mitral Regurgitation' },
  { id: 'f4', label: 'Finding 4: Pulmonary Hypertension' },
  { id: 'f5', label: 'Finding 5: Mild Aortic Valve Sclerosis' },
  { id: 'f6', label: 'Finding 6: Pericardial Effusion' },
]
