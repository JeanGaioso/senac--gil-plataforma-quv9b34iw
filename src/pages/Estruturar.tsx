import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/use-session-store'
import { updateConsultancy, generateGoldenTasks, generateSwot } from '@/services/consultancies'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Sparkles, Wand2, Loader2, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function EstruturarPage() {
  const { session, updateSession } = useSessionStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [goldenTask, setGoldenTask] = useState(session.goldenTask || '')

  // Custom cast to safely access new SWOT fields even if strict types are applied in the store
  const sessionData = session as any
  const [strengths, setStrengths] = useState(sessionData.strengths || '')
  const [weaknesses, setWeaknesses] = useState(sessionData.weaknesses || '')
  const [opportunities, setOpportunities] = useState(sessionData.opportunities || '')
  const [threats, setThreats] = useState(sessionData.threats || '')

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const [swotSuggestions, setSwotSuggestions] = useState<any[]>([])
  const [isGeneratingSwot, setIsGeneratingSwot] = useState(false)

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
        toast({ title: 'Sugestões geradas!' })
      }
    } catch (error) {
      toast({ title: 'Erro ao gerar', variant: 'destructive' })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateSwot = async () => {
    setIsGeneratingSwot(true)
    try {
      const res = await generateSwot({
        fato: session.fato,
        dor: session.dor,
        desejo: session.desejo,
      })
      if (res.suggestions && res.suggestions.length > 0) {
        setSwotSuggestions(res.suggestions)
        toast({ title: 'Análises SWOT geradas!' })
      }
    } catch (error) {
      toast({ title: 'Erro ao gerar SWOT', variant: 'destructive' })
    } finally {
      setIsGeneratingSwot(false)
    }
  }

  const applySwot = (swot: any) => {
    setStrengths(swot.strengths || '')
    setWeaknesses(swot.weaknesses || '')
    setOpportunities(swot.opportunities || '')
    setThreats(swot.threats || '')
    setSwotSuggestions([])
    toast({ title: 'SWOT Aplicado', description: 'Você pode editar os quadros manualmente agora.' })
  }

  const isFormValid = strengths && weaknesses && opportunities && threats && goldenTask

  const handleNext = async () => {
    if (isFormValid) {
      if (session.consultancyId) {
        try {
          await updateConsultancy(session.consultancyId, {
            estruturar_data: { strengths, weaknesses, opportunities, threats },
            tarefa_ouro: goldenTask,
          })
        } catch (error) {
          console.error(error)
        }
      }
      updateSession({ goldenTask, strengths, weaknesses, opportunities, threats } as any)
      navigate('/escalar')
    }
  }

  const handleBack = () => {
    updateSession({ goldenTask, strengths, weaknesses, opportunities, threats } as any)
    navigate('/sentir')
  }

  return (
    <Card className="shadow-lg border-primary/10 animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Fase 2: Estruturar (Estratégia)</CardTitle>
        <CardDescription>
          Defina a Tarefa de Ouro e realize a Análise SWOT da consultoria.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Golden Task Section */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Label
              htmlFor="goldenTask"
              className="text-base font-bold text-primary flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-secondary" />
              Tarefa de Ouro (Metodologia SMART)
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="text-primary border-primary shrink-0"
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
            placeholder="Ex: Aumentar a conversão em 15% até o final do trimestre..."
            className="min-h-[90px] bg-white focus-visible:ring-secondary border-primary/20 font-medium resize-none"
          />
          {suggestions.length > 0 && (
            <div className="pt-2 space-y-2 animate-fade-in">
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
                      className="shrink-0 text-secondary border-secondary w-full sm:w-auto"
                    >
                      <Check className="w-4 h-4 mr-1" /> Usar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SWOT Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Label className="text-base font-bold text-slate-800 flex items-center gap-2">
              Matriz SWOT (Forças, Fraquezas, Oportunidades, Ameaças)
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateSwot}
              disabled={isGeneratingSwot}
              className="shrink-0"
            >
              {isGeneratingSwot ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              Gerar SWOT
            </Button>
          </div>

          {swotSuggestions.length > 0 && (
            <div className="space-y-2 animate-fade-in mb-4 bg-white p-3 rounded-md border shadow-sm">
              <p className="text-sm font-semibold text-slate-700">Opções sugeridas de SWOT:</p>
              <div className="grid gap-2">
                {swotSuggestions.map((sug, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 border rounded p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="text-xs text-slate-600 line-clamp-2 flex-1">
                      <span className="font-semibold text-emerald-700">Forças:</span>{' '}
                      {sug.strengths} |{' '}
                      <span className="font-semibold text-rose-700">Fraquezas:</span>{' '}
                      {sug.weaknesses}
                    </div>
                    <Button size="sm" onClick={() => applySwot(sug)} className="w-full sm:w-auto">
                      Usar Opção {i + 1}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 bg-emerald-50/50 p-3 rounded border border-emerald-100 shadow-sm">
              <Label className="text-emerald-700 font-bold">Forças (Strengths)</Label>
              <Textarea
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                className="bg-white border-emerald-200 focus-visible:ring-emerald-500 min-h-[100px] resize-none"
                placeholder="Fatores internos positivos (ex: equipe engajada, caixa positivo)..."
              />
            </div>
            <div className="space-y-1 bg-rose-50/50 p-3 rounded border border-rose-100 shadow-sm">
              <Label className="text-rose-700 font-bold">Fraquezas (Weaknesses)</Label>
              <Textarea
                value={weaknesses}
                onChange={(e) => setWeaknesses(e.target.value)}
                className="bg-white border-rose-200 focus-visible:ring-rose-500 min-h-[100px] resize-none"
                placeholder="Fatores internos a melhorar (ex: processos desestruturados)..."
              />
            </div>
            <div className="space-y-1 bg-blue-50/50 p-3 rounded border border-blue-100 shadow-sm">
              <Label className="text-blue-700 font-bold">Oportunidades (Opportunities)</Label>
              <Textarea
                value={opportunities}
                onChange={(e) => setOpportunities(e.target.value)}
                className="bg-white border-blue-200 focus-visible:ring-blue-500 min-h-[100px] resize-none"
                placeholder="Fatores externos favoráveis (ex: expansão do mercado)..."
              />
            </div>
            <div className="space-y-1 bg-amber-50/50 p-3 rounded border border-amber-100 shadow-sm">
              <Label className="text-amber-700 font-bold">Ameaças (Threats)</Label>
              <Textarea
                value={threats}
                onChange={(e) => setThreats(e.target.value)}
                className="bg-white border-amber-200 focus-visible:ring-amber-500 min-h-[100px] resize-none"
                placeholder="Fatores externos de risco (ex: concorrência agressiva)..."
              />
            </div>
          </div>
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
            disabled={!isFormValid}
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
