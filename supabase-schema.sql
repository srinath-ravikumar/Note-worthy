-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- Project: Note-Worthy CS568 Medical Survey

CREATE TABLE IF NOT EXISTS survey_responses (
  id               UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  participant_id   TEXT      NOT NULL UNIQUE,
  started_at       TIMESTAMPTZ,
  metadata         JSONB,
  pre_survey       JSONB,
  llm_prompt       TEXT,
  llm_rewrite      TEXT,
  dynamic_mcqs     JSONB,
  post_survey      JSONB,
  completed        BOOLEAN   DEFAULT FALSE
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON survey_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row-level security: allow inserts and updates from service role only
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Allow the service role (used by Next.js API routes) full access
CREATE POLICY "service_role_all" ON survey_responses
  FOR ALL USING (true) WITH CHECK (true);
