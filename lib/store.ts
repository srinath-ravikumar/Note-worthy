'use client'

import { useCallback, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { SurveyState } from './types'

const STORAGE_KEY = 'cs568_survey_v1'

const defaultState: SurveyState = {
  participantId: '',
  startedAt: '',
  currentStep: 0,
  metadata: null,
  preSurvey: null,
  llmRewrite: null,
  llmPrompt: null,
  dynamicMCQs: null,
  postSurvey: null,
  completedAt: null,
}

function readStorage(): SurveyState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SurveyState) : null
  } catch {
    return null
  }
}

function writeStorage(state: SurveyState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage quota exceeded — proceed without persistence
  }
}

export function useSurveyStore() {
  const [state, setState] = useState<SurveyState>(defaultState)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = readStorage()
    if (stored && stored.participantId) {
      setState(stored)
    } else {
      const fresh: SurveyState = {
        ...defaultState,
        participantId: uuidv4(),
        startedAt: new Date().toISOString(),
      }
      setState(fresh)
      writeStorage(fresh)
    }
    setLoaded(true)
  }, [])

  const update = useCallback((updates: Partial<SurveyState>) => {
    setState(prev => {
      const next = { ...prev, ...updates }
      writeStorage(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    const fresh: SurveyState = {
      ...defaultState,
      participantId: uuidv4(),
      startedAt: new Date().toISOString(),
    }
    setState(fresh)
    writeStorage(fresh)
  }, [])

  return { state, update, reset, loaded }
}
