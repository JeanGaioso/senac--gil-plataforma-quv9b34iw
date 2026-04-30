import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/use-session-store'
import { updateConsultancy } from '@/services/consultancies'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Save, Lightbulb, Wand2, Loader2, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export default function EscalarPage() {
  const { session, updateSession, finishSession } = useSessionStore()
  const navigate = useNavigate()

  const [microTarefa, setMicroTarefa] = useState(session.microTarefa || '')
  const [showModal, setShowModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  const generateSuggestions = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const taskAction = session.goldenTask ? session.goldenTask.split(' ')[0] : 'Implementar'
      const contextSubject = session.goldenTask
        ? session.goldenTask.substring(taskAction.length).trim()
        : 'a estratégia definida'

      const templates = [
        `Criar um plano de ação simples para ${contextSubject || 'a melhoria contínua'} e delegar a primeira tarefa hoje.`,
        `Agendar uma reunião de 15 minutos com a equipe para alinhar os próximos passos sobre ${contextSubject || 'as novas metas'}.`,
        `Desenvolver um checklist de 3 itens focados em ${taskAction} para iniciar amanhã cedo.`,
        `Revisar os recursos necessários para ${contextSubject || 'o projeto'} e listar o que falta nas próximas 24h.`,
        `Entrar em contato com o principal envolvido para validar a execução de ${contextSubject || 'nossa ideia'}.`,
        `Documentar o processo atual focado em ${taskAction} para identificar o primeiro gargalo a ser resolvido hoje.`,
      ]

      const shuffled = templates.sort(() => 0.5 - Math.random())
      setSuggestions(shuffled.slice(0, 3).map((s) => `[Sugerido por IA] ${s}`))
      setIsGenerating(false)
    }, 1200)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setMicroTarefa(suggestion)
  }

  const handleFinish = () => {
    if (!microTarefa) return

    // 24h Validator Logic (AI Simulation)
    const complexTerms = [
      'sistema',
      'plataforma',
      'reestruturar',
      'tudo',
      'app completo',
      'contratar equipe',
    ]
    const isComplex =
      complexTerms.some((term) => microTarefa.toLowerCase().includes(term)) ||
      microTarefa.length > 150

    if (isComplex) {
      setShowModal(true)
    } else {
      proceedToFinish()
    }
  }

  const proceedToFinish = async () => {
    if (session.consultancyId) {
      try {
        await updateConsultancy(session.consultancyId, {
          escalar_data: { microTarefa },
          status: 'completed',
        })
      } catch (error) {
        console.error(error)
      }
    }
    updateSession({ microTarefa })
    finishSession()
    navigate('/resumo')
  }

  const handleBack = () => {
    updateSession({ microTarefa })
    navigate('/estruturar')
  }

  return (
    <div className="max-w-3xl mx-auto w-full">
      <Card className="shadow-lg border-primary/10 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-2xl text-senac-blue">Fase 3: Escalar (Execução)</CardTitle>
          <CardDescription>
            Defina a primeira ação imediata que o cliente executará após a sessão.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <Label htmlFor="microTarefa" className="text-lg font-bold flex items-center gap-2">
                  Micro-Tarefa 24h
                  <Lightbulb className="w-5 h-5 text-senac-orange" />
                </Label>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  O que pode ser feito em até 24 horas para dar o primeiro passo em direção ao
                  objetivo? Escreva manualmente ou use a IA para gerar sugestões.
                </p>
              </div>
              <Button
                onClick={generateSuggestions}
                disabled={isGenerating}
                className="bg-senac-orange hover:bg-senac-orange/90 text-white shadow-md transition-all whitespace-nowrap"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                Gera com IA
              </Button>
            </div>

            {suggestions.length > 0 && (
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg space-y-3 animate-fade-in">
                <p className="text-sm font-medium text-slate-600 mb-2">
                  Sugestões da IA (clique para selecionar):
                </p>
                {suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="p-3 bg-white border border-slate-200 rounded-md cursor-pointer hover:border-senac-blue hover:shadow-sm transition-all text-sm text-slate-700 flex items-start gap-3 group"
                  >
                    <CheckCircle2
                      className={cn(
                        'w-5 h-5 mt-0.5 shrink-0 transition-colors',
                        microTarefa === suggestion
                          ? 'text-senac-blue'
                          : 'text-slate-200 group-hover:text-senac-blue/40',
                      )}
                    />
                    <span className="leading-relaxed">
                      {suggestion.replace('[Sugerido por IA] ', '')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="relative transition-all duration-500">
              <Textarea
                id="microTarefa"
                value={microTarefa}
                onChange={(e) => setMicroTarefa(e.target.value)}
                placeholder="Ex: Ligar para os 3 principais fornecedores para renegociar tabela..."
                className="min-h-[120px] resize-none text-base focus-visible:ring-senac-blue transition-colors duration-300"
              />
              <div className="absolute bottom-3 right-3 text-xs font-medium text-muted-foreground">
                {microTarefa.length} caracteres
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-between gap-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              className="text-senac-blue border-senac-blue hover:bg-senac-blue hover:text-white transition-colors"
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
            </Button>
            <Button
              onClick={handleFinish}
              disabled={!microTarefa}
              size="lg"
              className="bg-senac-blue text-white hover:bg-senac-blue/90 hover:scale-105 transition-transform"
            >
              <Save className="mr-2 w-4 h-4" /> Finalizar Intervenção
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-senac-orange flex items-center gap-2">
              <Lightbulb className="w-5 h-5" /> Sugestão de Subdivisão
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Esta tarefa parece complexa demais para ser concluída em apenas 24 horas. Para manter
              o ritmo ágil, qual seria o <strong>primeiro passo menor</strong> absoluto desta ação?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              className="w-full sm:w-auto"
            >
              Revisar Tarefa
            </Button>
            <Button
              onClick={proceedToFinish}
              className="w-full sm:w-auto bg-senac-blue hover:bg-senac-blue/90 text-white"
            >
              Manter e Finalizar Mesmo Assim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
