import React, { createContext, useContext, useState, useEffect } from 'react'

export type SessionData = {
  clientName: string
  consultantName: string
  fato: string
  dor: string
  desejo: string
  goldenTask: string
  pontosFortes: string
  riscos: string
  kpis: string
  microTarefa: string
  startTime: number | null
  isFinished: boolean
}

const defaultState: SessionData = {
  clientName: '',
  consultantName: '',
  fato: '',
  dor: '',
  desejo: '',
  goldenTask: '',
  pontosFortes: '',
  riscos: '',
  kpis: '',
  microTarefa: '',
  startTime: null,
  isFinished: false,
}

type SessionContextType = {
  session: SessionData
  updateSession: (data: Partial<SessionData>) => void
  startSession: (client: string, consultant: string) => void
  finishSession: () => void
  resetSession: () => void
}

const SessionContext = createContext<SessionContextType | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionData>(() => {
    try {
      const saved = localStorage.getItem('senac-agil-session')
      return saved ? JSON.parse(saved) : defaultState
    } catch {
      return defaultState
    }
  })

  useEffect(() => {
    localStorage.setItem('senac-agil-session', JSON.stringify(session))
  }, [session])

  const updateSession = (data: Partial<SessionData>) => {
    setSession((prev) => ({ ...prev, ...data }))
  }

  const startSession = (client: string, consultant: string) => {
    setSession({
      ...defaultState,
      clientName: client,
      consultantName: consultant,
      startTime: Date.now(),
      isFinished: false,
    })
  }

  const finishSession = () => updateSession({ isFinished: true })

  const resetSession = () => {
    setSession(defaultState)
    localStorage.removeItem('senac-agil-session')
  }

  return (
    <SessionContext.Provider
      value={{ session, updateSession, startSession, finishSession, resetSession }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSessionStore() {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSessionStore must be used within SessionProvider')
  return context
}
