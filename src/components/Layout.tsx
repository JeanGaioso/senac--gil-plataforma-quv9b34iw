import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Timer, CheckCircle2, Circle, ChevronDown, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSessionStore } from '@/stores/use-session-store'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

const TimerDisplay = () => {
  const { session, finishSession } = useSessionStore()
  const navigate = useNavigate()
  const [timeLeft, setTimeLeft] = useState(1200)

  useEffect(() => {
    if (!session.startTime || session.isFinished) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - session.startTime!) / 1000)
      const remaining = Math.max(0, 1200 - elapsed)
      setTimeLeft(remaining)

      if (remaining <= 0) {
        clearInterval(interval)
        finishSession()
        navigate('/resumo')
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [session.startTime, session.isFinished, finishSession, navigate])

  if (!session.startTime || session.isFinished) return null

  const mins = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0')
  const secs = (timeLeft % 60).toString().padStart(2, '0')

  const isUrgent = timeLeft <= 60 // under 1 min
  const isWarning = timeLeft <= 300 && timeLeft > 60 // under 5 mins

  let colorClass = 'text-foreground'
  if (isUrgent) colorClass = 'text-destructive animate-pulse'
  else if (isWarning) colorClass = 'text-secondary animate-pulse'

  return (
    <div className={cn('text-xl font-bold flex items-center gap-2', colorClass)}>
      <Timer className="w-5 h-5" />
      <span>
        {mins}:{secs}
      </span>
    </div>
  )
}

export default function Layout() {
  const { session } = useSessionStore()
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const publicPaths = ['/', '/nova']
    if (!session.clientName && !publicPaths.includes(location.pathname)) {
      navigate('/')
    }
  }, [session.clientName, location.pathname, navigate])

  const steps = [
    { path: '/sentir', label: '1. Sentir' },
    { path: '/estruturar', label: '2. Estruturar' },
    { path: '/escalar', label: '3. Escalar' },
  ]
  const showStepper = steps.some((s) => s.path === location.pathname)

  return (
    <main className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm print:hidden">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-primary">Senac-Ágil</span>
          </div>
          <div className="flex items-center gap-4">
            <TimerDisplay />
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
                    <span className="max-w-[120px] truncate">{user.name || user.email}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/')}>Meus Projetos</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="w-4 h-4 mr-2" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {showStepper && (
        <div className="w-full bg-white border-b py-4 print:hidden">
          <div className="container flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto">
            {steps.map((s, i) => {
              const isActive = s.path === location.pathname
              const isPast = steps.findIndex((x) => x.path === location.pathname) > i
              return (
                <div key={s.path} className="flex items-center gap-2 sm:gap-4 shrink-0">
                  <div className="flex items-center gap-2">
                    {isPast ? (
                      <CheckCircle2 className="text-green-500 w-5 h-5" />
                    ) : (
                      <Circle className={cn('w-5 h-5', isActive ? 'text-primary' : 'text-muted')} />
                    )}
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isActive ? 'text-primary' : 'text-muted-foreground',
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && <div className="w-8 sm:w-16 h-[2px] bg-border" />}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex-1 container mx-auto p-4 md:p-8 flex flex-col items-center justify-start">
        <div className="w-full max-w-4xl">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
