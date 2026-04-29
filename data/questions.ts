// ─── SECTION 1 — DEMOGRAPHICS ────────────────────────────────────────────────

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
      { value: '55-64', label: '55–64' },
      { value: '65+', label: '65 or older' },
    ],
    required: true,
  },
  {
    id: 'gender',
    label: 'What is your gender?',
    type: 'radio',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'non-binary', label: 'Non-binary' },
      { value: 'prefer-not-to-say', label: 'Prefer not to say' },
    ],
    required: true,
  },
  {
    id: 'education',
    label: 'What is your highest level of education completed?',
    type: 'radio',
    options: [
      { value: 'high-school', label: 'High school diploma / GED' },
      { value: 'some-college', label: 'Some college (no degree)' },
      { value: 'bachelors', label: "Bachelor's degree" },
      { value: 'masters', label: "Master's degree" },
      { value: 'doctoral', label: 'Doctoral degree (PhD, EdD, etc.)' },
      { value: 'professional', label: 'Professional / Medical degree (MD, JD, PharmD, etc.)' },
    ],
    required: true,
  },
  {
    id: 'medicalBackground',
    label: 'Do you have a medical or healthcare background?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
    required: true,
  },
  {
    id: 'readingFrequency',
    label: 'How often do you read medical documents (lab reports, radiology reports, discharge summaries)?',
    type: 'radio',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'often', label: 'Often' },
      { value: 'very-often', label: 'Very often' },
    ],
    required: true,
  },
]

// ─── SECTION 2 — PRE-SURVEY ───────────────────────────────────────────────────

// Medical terminology checkboxes (derived from the echocardiogram report)
export const TERMINOLOGY_OPTIONS = [
  { value: 'echocardiography', label: 'Echocardiography' },
  { value: 'transthoracic', label: 'Transthoracic' },
  { value: 'hypertension', label: 'Hypertension' },
  { value: 'dyslipidemia', label: 'Dyslipidemia' },
  { value: 'tdi', label: 'Tissue Doppler Imaging (TDI)' },
  { value: 'exertional_dyspnea', label: 'Exertional Dyspnea' },
  { value: 'lower_extremity_edema', label: 'Lower Extremity Edema' },
  { value: 'lbbb', label: 'Left Bundle Branch Block (LBBB)' },
  { value: 'non_ischemic_etiology', label: 'Non-Ischemic Etiology' },
  { value: 'ischemic_cardiomyopathy', label: 'Ischemic Cardiomyopathy' },
  { value: 'coronary_angiography', label: 'Coronary Angiography' },
]

// The 6 findings from the echocardiogram report
export const FINDING_LABELS = [
  { id: 'f1', label: 'Finding 1: Left Ventricular Systolic Dysfunction' },
  { id: 'f2', label: 'Finding 2: Diastolic Dysfunction — Grade II' },
  { id: 'f3', label: 'Finding 3: Moderate Mitral Regurgitation' },
  { id: 'f4', label: 'Finding 4: Pulmonary Hypertension' },
  { id: 'f5', label: 'Finding 5: Mild Aortic Valve Sclerosis' },
  { id: 'f6', label: 'Finding 6: Pericardial Effusion' },
]

export const PREFERRED_STRUCTURE_OPTIONS = [
  { value: 'bullets', label: 'Bullet points — concise, scannable' },
  { value: 'paragraphs', label: 'Short paragraphs — more explanatory flow' },
  { value: 'mixed', label: 'Mixed — headers with bullets and brief explanations' },
]

// ─── SECTION 3 — POST-SURVEY ──────────────────────────────────────────────────

export const VERSION_PREFERENCE_OPTIONS = [
  { value: 'strongly-prefer-rewrite', label: 'Strongly prefer the rewritten version' },
  { value: 'prefer-rewrite', label: 'Prefer the rewritten version' },
  { value: 'no-preference', label: 'No preference' },
  { value: 'prefer-original', label: 'Prefer the original version' },
  { value: 'strongly-prefer-original', label: 'Strongly prefer the original version' },
]
