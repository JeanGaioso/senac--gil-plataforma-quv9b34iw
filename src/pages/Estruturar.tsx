import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/use-session-store'
import { updateConsultancy, generateGoldenTasks } from '@/services/consultancies'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Sparkles, Wand2, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

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

  const [isGenerating, setIsGenerating] = useState(false)

  const hasSwotContent =
    strengths.trim() !== '' ||
    weaknesses.trim() !== '' ||
    opportunities.trim() !== '' ||
    threats.trim() !== ''

  const handleGenerateAI = async () => {
    if (!hasSwotContent) {
      toast({
        title: 'Preencha ao menos um campo da matriz SWOT antes de gerar a Tarefa de Ouro.',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)
    try {
      const res = await generateGoldenTasks({
        swot: { strengths, weaknesses, opportunities, threats },
        sentir_data: sessionData.sentir_data || {},
      })
      if (res.task) {
        setGoldenTask(res.task)
        updateSession({ goldenTask: res.task } as any)
        if (session.consultancyId) {
          try {
            await updateConsultancy(session.consultancyId, {
              tarefa_ouro: res.task,
              estruturar_data: { strengths, weaknesses, opportunities, threats },
            })
          } catch (dbError) {
            console.error('Erro ao persistir Tarefa de Ouro', dbError)
          }
        }
        toast({ title: 'Tarefa de Ouro gerada com sucesso!' })
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.message || error?.message || 'Não foi possível conectar ao motor de IA.'
      toast({
        title: 'Erro ao gerar Tarefa de Ouro',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
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
          Defina a Matriz SWOT e gere a Tarefa de Ouro baseada na análise.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* SWOT Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="flex flex-col gap-1">
            <Label className="text-base font-bold text-slate-800 flex items-center gap-2">
              Matriz SWOT (Forças, Fraquezas, Oportunidades, Ameaças)
            </Label>
            <p className="text-sm text-slate-500">
              Preencha os quadrantes abaixo com a análise do contexto do cliente.
            </p>
          </div>

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

        {/* Golden Task Section */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <Label
                htmlFor="goldenTask"
                className="text-base font-bold text-primary flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-secondary" />
                Tarefa de Ouro (Metodologia SMART)
              </Label>
              <p className="text-sm text-slate-600">
                O objetivo principal derivado da análise. Preencha manualmente ou gere com IA a
                partir da SWOT.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateAI}
              disabled={isGenerating || !hasSwotContent}
              className={cn(
                'shrink-0',
                hasSwotContent
                  ? 'text-primary border-primary hover:bg-primary/10'
                  : 'text-muted-foreground',
              )}
              title={
                !hasSwotContent
                  ? 'Preencha ao menos um campo da Matriz SWOT primeiro para utilizar a IA'
                  : 'Gerar Tarefa de Ouro usando IA'
              }
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              Gerar com IA
            </Button>
          </div>
          <div className="relative">
            <Textarea
              id="goldenTask"
              value={goldenTask}
              onChange={(e) => setGoldenTask(e.target.value)}
              disabled={isGenerating}
              placeholder={
                isGenerating
                  ? 'Analisando SWOT e gerando Tarefa de Ouro...'
                  : 'Ex: Aumentar a conversão em 15% até o final do trimestre implementando novo script de vendas focado na dor mapeada...'
              }
              className={cn(
                'min-h-[90px] bg-white focus-visible:ring-secondary border-primary/20 font-medium resize-none transition-all',
                isGenerating && 'opacity-50 animate-pulse cursor-not-allowed',
              )}
            />
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Loader2 className="w-8 h-8 text-primary animate-spin opacity-80" />
              </div>
            )}
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
