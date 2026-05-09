import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/use-session-store'
import { updateConsultancy, generateExecutionPlan } from '@/services/consultancies'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ArrowLeft,
  Save,
  Wand2,
  Loader2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Target,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface PlanStep {
  title: string
  description: string
  timeframe: string
  selected?: boolean
}

export default function EscalarPage() {
  const { session, updateSession, finishSession } = useSessionStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [plan, setPlan] = useState<PlanStep[]>(session.plan || [])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGeneratePlan = async () => {
    if (!session.goldenTask) {
      toast({
        title: 'Tarefa de Ouro ausente',
        description: 'Retorne à fase anterior e defina a Tarefa de Ouro antes de gerar o plano.',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)
    try {
      const res = await generateExecutionPlan({
        consultantName: session.consultantName || '',
        clientName: session.clientName || '',
        goldenTask: session.goldenTask,
        swot: {
          strengths: session.strengths,
          weaknesses: session.weaknesses,
          opportunities: session.opportunities,
          threats: session.threats,
        },
      })

      if (res.plan && Array.isArray(res.plan)) {
        const initializedPlan = res.plan.map((p: any, i: number) => ({ ...p, selected: i < 3 }))
        setPlan(initializedPlan)
        updateSession({ plan: initializedPlan } as any)
        if (session.consultancyId) {
          try {
            await updateConsultancy(session.consultancyId, {
              escalar_data: { plan: initializedPlan },
            })
          } catch (dbError) {
            console.error('Erro ao persistir Plano de Execução', dbError)
          }
        }
        toast({ title: 'Plano de Execução gerado com sucesso!' })
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.message || error?.message || 'Não foi possível conectar ao motor de IA.'
      toast({ title: 'Erro ao gerar Plano', description: errorMessage, variant: 'destructive' })
    } finally {
      setIsGenerating(false)
    }
  }

  const selectedCount = plan.filter((p) => p.selected).length

  const handleToggleSelect = (index: number, checked: boolean) => {
    if (checked && selectedCount >= 3) {
      toast({
        title: 'Limite atingido',
        description: 'Você só pode selecionar exatamente 3 ações para o relatório.',
        variant: 'destructive',
      })
      return
    }
    const newPlan = [...plan]
    newPlan[index].selected = checked
    setPlan(newPlan)
  }

  const handleStepChange = (index: number, field: keyof PlanStep, value: string) => {
    const newPlan = [...plan]
    newPlan[index] = { ...newPlan[index], [field]: value }
    setPlan(newPlan)
  }

  const proceedToFinish = async () => {
    if (plan.length === 0) {
      toast({
        title: 'Atenção',
        description: 'Gere ou preencha o plano de execução antes de finalizar.',
        variant: 'destructive',
      })
      return
    }

    if (selectedCount !== 3) {
      toast({
        title: 'Seleção incorreta',
        description: 'Selecione exatamente 3 ações para prosseguir.',
        variant: 'destructive',
      })
      return
    }

    const selectedPlans = plan.filter((p) => p.selected)

    if (session.consultancyId) {
      try {
        await updateConsultancy(session.consultancyId, {
          escalar_data: { plan: selectedPlans },
          status: 'completed',
        })
      } catch (error) {
        console.error(error)
        toast({ title: 'Erro ao salvar', variant: 'destructive' })
        return
      }
    }

    // Keep microTarefa synced for any backward compatibility in Resumo
    updateSession({ plan, microTarefa: selectedPlans[0]?.title || plan[0]?.title } as any)
    finishSession()
    navigate('/resumo')
  }

  const handleBack = () => {
    updateSession({ plan } as any)
    navigate('/estruturar')
  }

  const hasPlan = plan.length > 0

  return (
    <div className="max-w-4xl mx-auto w-full">
      <Card className="shadow-lg border-primary/10 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Fase 3: Escalar (Execução)</CardTitle>
          <CardDescription>
            Crie um plano de ação estruturado com base na Tarefa de Ouro gerada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <Label className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <Target className="w-5 h-5 text-secondary" />
                Plano de Execução
              </Label>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                O que o cliente precisa executar para atingir o objetivo? Use a IA para gerar um
                plano pragmático e edite conforme necessário.
              </p>
            </div>
            <Button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="bg-secondary hover:bg-secondary/90 text-white shadow-md transition-all whitespace-nowrap"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              Gerar Plano com IA
            </Button>
          </div>

          {isGenerating && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-muted-foreground animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p>A IA está estruturando as ações estratégicas...</p>
            </div>
          )}

          {!isGenerating && hasPlan && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
                <span className="font-medium text-slate-700">
                  Ações selecionadas para o relatório:
                </span>
                <span
                  className={cn(
                    'font-bold text-lg px-3 py-1 rounded-md',
                    selectedCount === 3
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700',
                  )}
                >
                  {selectedCount} / 3
                </span>
              </div>
              <div className="grid gap-4">
                {plan.map((step, idx) => (
                  <Card
                    key={idx}
                    className={cn(
                      'border-slate-200 shadow-sm relative overflow-hidden group transition-colors',
                      step.selected ? 'border-green-400 bg-green-50/10' : 'hover:border-primary/40',
                    )}
                  >
                    <div
                      className={cn(
                        'absolute left-0 top-0 bottom-0 w-1.5 transition-colors',
                        step.selected ? 'bg-green-500' : 'bg-primary/80 group-hover:bg-primary',
                      )}
                    ></div>
                    <CardContent className="p-4 pl-6 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            checked={!!step.selected}
                            onCheckedChange={(checked) =>
                              handleToggleSelect(idx, checked as boolean)
                            }
                            className="w-5 h-5 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                          />
                          <Input
                            value={step.title}
                            onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                            className="font-bold border-transparent shadow-none focus-visible:border-primary focus-visible:ring-1 h-9 px-2 text-base flex-1"
                            placeholder="Título da Ação"
                          />
                        </div>
                        <div className="flex items-center gap-2 shrink-0 bg-slate-100 px-3 py-1 rounded-md">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <Input
                            value={step.timeframe}
                            onChange={(e) => handleStepChange(idx, 'timeframe', e.target.value)}
                            className="w-28 text-sm h-8 bg-transparent border-none shadow-none px-1 focus-visible:ring-0 text-slate-700 font-medium"
                            placeholder="Prazo"
                          />
                        </div>
                      </div>
                      <Textarea
                        value={step.description}
                        onChange={(e) => handleStepChange(idx, 'description', e.target.value)}
                        className="resize-none min-h-[60px] text-sm text-slate-600 border-transparent shadow-none focus-visible:border-primary/30 focus-visible:ring-1 bg-slate-50/50 p-2 ml-8"
                        placeholder="Descrição detalhada do que deve ser feito..."
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!isGenerating && !hasPlan && (
            <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
              <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500 font-medium">Nenhum plano gerado ainda.</p>
              <p className="text-sm text-slate-400 mt-1">
                Clique em "Gerar Plano com IA" para iniciar.
              </p>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row justify-between gap-4 border-t mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              className="text-primary border-primary hover:bg-primary hover:text-white transition-colors"
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
            </Button>
            <Button
              onClick={proceedToFinish}
              disabled={!hasPlan || isGenerating || selectedCount !== 3}
              size="lg"
              className="bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              <Save className="mr-2 w-4 h-4" /> Finalizar Intervenção
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
