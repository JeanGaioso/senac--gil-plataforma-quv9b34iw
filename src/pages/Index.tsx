import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/use-session-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Play } from 'lucide-react'

export default function IndexPage() {
  const { startSession } = useSessionStore()
  const navigate = useNavigate()

  const [clientName, setClientName] = useState('')
  const [consultantName, setConsultantName] = useState('')

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault()
    if (clientName && consultantName) {
      startSession(clientName, consultantName)
      navigate('/sentir')
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
              className="w-full text-lg h-12 hover:scale-[1.02] transition-transform"
            >
              <Play className="mr-2 w-5 h-5" />
              Começar Sessão (20 min)
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
