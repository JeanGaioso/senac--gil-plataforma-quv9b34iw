import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/use-session-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'

export default function EstruturarPage() {
  const { session, updateSession } = useSessionStore()
  const navigate = useNavigate()

  const [goldenTask, setGoldenTask] = useState(session.goldenTask)
  const [pontosFortes, setPontosFortes] = useState(session.pontosFortes)
  const [riscos, setRiscos] = useState(session.riscos)
  const [kpis, setKpis] = useState(session.kpis)

  useEffect(() => {
    if (!goldenTask && session.fato && session.dor && session.desejo) {
      // AI Engine Simulation
      const generated = `Ação: Focar em "${session.desejo}"\nObjeto: Mitigar "${session.dor}"\nContexto: Considerando "${session.fato}"\nPrazo: 30 dias com métrica definida.`
      setGoldenTask(generated)
    }
  }, [goldenTask, session])

  const handleNext = () => {
    if (pontosFortes && kpis) {
      updateSession({ goldenTask, pontosFortes, riscos, kpis })
      navigate('/escalar')
    }
  }

  const handleBack = () => {
    updateSession({ goldenTask, pontosFortes, riscos, kpis })
    navigate('/sentir')
  }

  return (
    <Card className="shadow-lg border-primary/10 animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Fase 2: Estruturar (Estratégia)</CardTitle>
        <CardDescription>
          Revise a Tarefa de Ouro gerada e preencha os parâmetros estratégicos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2 relative">
          <div className="absolute top-4 right-4 text-secondary">
            <Sparkles className="w-5 h-5" />
          </div>
          <Label htmlFor="goldenTask" className="text-base font-bold text-primary">
            Tarefa de Ouro Gerada
          </Label>
          <Textarea
            id="goldenTask"
            value={goldenTask}
            onChange={(e) => setGoldenTask(e.target.value)}
            className="min-h-[100px] font-medium resize-none bg-white focus-visible:ring-secondary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="pontosFortes">Pontos Fortes da Empresa</Label>
            <Input
              id="pontosFortes"
              value={pontosFortes}
              onChange={(e) => setPontosFortes(e.target.value)}
              placeholder="Ex: Equipe engajada, caixa positivo..."
              className="focus-visible:ring-secondary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="riscos">Riscos Potenciais</Label>
            <Input
              id="riscos"
              value={riscos}
              onChange={(e) => setRiscos(e.target.value)}
              placeholder="Ex: Falta de tempo, concorrência..."
              className="focus-visible:ring-secondary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="kpis">KPIs (Indicadores Numéricos de Sucesso)</Label>
          <Input
            id="kpis"
            value={kpis}
            onChange={(e) => setKpis(e.target.value)}
            placeholder="Ex: Aumentar conversão em 15%..."
            className="focus-visible:ring-secondary"
          />
        </div>

        <div className="pt-4 flex justify-between border-t">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
          </Button>
          <Button
            onClick={handleNext}
            disabled={!pontosFortes || !kpis}
            size="lg"
            className="hover:scale-105 transition-transform"
          >
            Avançar para Escalar
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
