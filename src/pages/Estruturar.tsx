import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/use-session-store'
import { updateConsultancy, generateGoldenTasks } from '@/services/consultancies'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Sparkles, Wand2, Loader2, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function EstruturarPage() {
  const { session, updateSession } = useSessionStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [goldenTask, setGoldenTask] = useState(session.goldenTask || '')
  const [pontosFortes, setPontosFortes] = useState(session.pontosFortes || '')
  const [riscos, setRiscos] = useState(session.riscos || '')
  const [kpis, setKpis] = useState(session.kpis || '')

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateAI = async () => {
    setIsGenerating(true)
    try {
      const res = await generateGoldenTasks({
        fato: session.fato,
        dor: session.dor,
        desejo: session.desejo,
      })
      if (res.suggestions && res.suggestions.length > 0) {
        setSuggestions(res.suggestions)
        toast({
          title: 'Sugestões geradas!',
          description: 'Escolha uma das sugestões abaixo ou edite manualmente.',
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro ao gerar com IA',
        description: 'Houve um problema ao comunicar com o servidor. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleNext = async () => {
    if (pontosFortes && kpis) {
      if (session.consultancyId) {
        try {
          await updateConsultancy(session.consultancyId, {
            estruturar_data: { pontosFortes, riscos, kpis },
            tarefa_ouro: goldenTask,
          })
        } catch (error) {
          console.error(error)
        }
      }
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
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3 relative">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="goldenTask"
              className="text-base font-bold text-primary flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-secondary" />
              Tarefa de Ouro
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="text-primary border-primary hover:bg-primary hover:text-white transition-colors"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              Gerar com IA
            </Button>
          </div>
          <Textarea
            id="goldenTask"
            value={goldenTask}
            onChange={(e) => setGoldenTask(e.target.value)}
            placeholder="Ex: Aumentar as vendas em 20% até o final do trimestre."
            className="min-h-[100px] font-medium resize-none bg-white focus-visible:ring-secondary border-primary/20"
          />

          {suggestions.length > 0 && (
            <div className="mt-3 space-y-2 animate-fade-in">
              <p className="text-sm font-semibold text-primary flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Opções sugeridas:
              </p>
              <div className="grid gap-2">
                {suggestions.map((sug, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-3 rounded-md border border-primary/10 shadow-sm gap-3 group hover:border-secondary transition-colors"
                  >
                    <p className="text-sm text-gray-700 flex-1">{sug}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setGoldenTask(sug)}
                      className="shrink-0 text-secondary border-secondary hover:bg-secondary hover:text-white w-full sm:w-auto"
                    >
                      <Check className="w-4 h-4 mr-1" /> Usar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
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

        <div className="pt-4 flex flex-col sm:flex-row justify-between gap-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            className="text-primary border-primary hover:bg-primary hover:text-white transition-colors"
          >
            <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
          </Button>
          <Button
            onClick={handleNext}
            disabled={!pontosFortes || !kpis}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-transform w-full sm:w-auto"
          >
            Avançar para Escalar
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
