import { createContext, useContext, useState, ReactNode } from 'react'

export interface SessionData {
  consultancyId?: string
  clientName?: string
  consultantName?: string
  startTime?: number
  isFinished?: boolean
  status?: 'draft' | 'completed'
  fato?: string
  dor?: string
  desejo?: string
  strengths?: string
  weaknesses?: string
  opportunities?: string
  threats?: string
  goldenTask?: string
  plan?: any[]
  microTarefa?: string
  pontosFortes?: string
  riscos?: string
  kpis?: string
}

interface SessionContextType {
  session: SessionData
  startSession: (clientName: string, consultantName: string) => void
  updateSession: (data: Partial<SessionData>) => void
  finishSession: () => void
  resetSession: () => void
  loadSession: (data: SessionData) => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export const useSessionStore = () => {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSessionStore must be used within a SessionProvider')
  return context
}

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<SessionData>({})

  const startSession = (clientName: string, consultantName: string) => {
    setSession({
      clientName,
      consultantName,
      startTime: Date.now(),
      isFinished: false,
      status: 'draft',
    })
  }

  const updateSession = (data: Partial<SessionData>) => {
    setSession((prev) => ({ ...prev, ...data }))
  }

  const finishSession = () => {
    setSession((prev) => ({ ...prev, isFinished: true, status: 'completed' }))
  }

  const resetSession = () => {
    setSession({})
  }

  const loadSession = (data: SessionData) => {
    setSession(data)
  }

  return (
    <SessionContext.Provider
      value={{ session, startSession, updateSession, finishSession, resetSession, loadSession }}
    >
      {children}
    </SessionContext.Provider>
  )
}
