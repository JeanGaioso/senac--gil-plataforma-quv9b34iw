import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/use-session-store'
import { useAuth } from '@/hooks/use-auth'
import { createConsultancy } from '@/services/consultancies'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function IndexPage() {
  const { startSession, updateSession } = useSessionStore()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [clientName, setClientName] = useState('')
  const [consultantName, setConsultantName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.name && !consultantName) {
      setConsultantName(user.name)
    }
  }, [user, consultantName])

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault()
    if (clientName && consultantName && user) {
      setLoading(true)
      try {
        const record = await createConsultancy({
          user: user.id,
          consultant_name: consultantName,
          client_name: clientName,
          status: 'draft',
          sentir_data: {},
          estruturar_data: {},
          escalar_data: {},
        })
        startSession(clientName, consultantName)
        updateSession({ consultancyId: record.id })
        navigate('/sentir')
      } catch (error) {
        toast.error('Erro ao iniciar sessão. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-fade-in">
      <Card className="w-full max-w-md shadow-xl border-primary/20">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-primary">Nova Intervenção</CardTitle>
          <CardDescription className="text-base">
            Inicie um diagnóstico ágil de 20 minutos focado em resultados rápidos e aplicáveis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStart} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente / Empresa</Label>
              <Input
                id="clientName"
                placeholder="Ex: Maria (Padaria Central)"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultantName">Nome do Consultor</Label>
              <Input
                id="consultantName"
                placeholder="Ex: João Silva"
                value={consultantName}
                onChange={(e) => setConsultantName(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-lg h-12 hover:scale-[1.02] transition-transform"
            >
              {loading ? (
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
              ) : (
                <Play className="mr-2 w-5 h-5" />
              )}
              Começar Sessão (20 min)
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
