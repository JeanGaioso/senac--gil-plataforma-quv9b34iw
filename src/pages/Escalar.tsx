import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/use-session-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Save, Lightbulb, Wand2, Edit3 } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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

  const [mode, setMode] = useState<'ai' | 'manual'>('ai')
  const [microTarefa, setMicroTarefa] = useState(session.microTarefa)
  const [showModal, setShowModal] = useState(false)

  // AI Micro-task generation based on Golden Task
  useEffect(() => {
    if (mode === 'ai') {
      const taskAction = session.goldenTask ? session.goldenTask.split(' ')[0] : 'Iniciar'
      setMicroTarefa(
        `[Sugerido por IA] ${taskAction} a organização dos dados principais e listar 3 ações imediatas nas próximas 24h.`,
      )
    } else if (microTarefa.startsWith('[Sugerido por IA]')) {
      setMicroTarefa('')
    }
  }, [mode, session.goldenTask])

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
      microTarefa.length > 100

    if (isComplex) {
      setShowModal(true)
    } else {
      proceedToFinish()
    }
  }

  const proceedToFinish = () => {
    updateSession({ microTarefa })
    finishSession()
    navigate('/resumo')
  }

  const handleBack = () => {
    updateSession({ microTarefa })
    navigate('/estruturar')
  }

  return (
    <>
      <Card className="shadow-lg border-primary/10 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Fase 3: Escalar (Execução)</CardTitle>
          <CardDescription>
            Defina a primeira ação imediata que o cliente executará após a sessão.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Label htmlFor="microTarefa" className="text-lg font-bold flex items-center gap-2">
                  Micro-Tarefa 24h
                  <Lightbulb className="w-5 h-5 text-secondary" />
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  O que pode ser feito em até 24 horas para dar o primeiro passo em direção ao
                  objetivo?
                </p>
              </div>
              <RadioGroup
                value={mode}
                onValueChange={(v) => setMode(v as 'ai' | 'manual')}
                className="flex flex-row items-center gap-4 bg-muted/50 p-2 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ai" id="mode-ai" />
                  <Label htmlFor="mode-ai" className="flex items-center gap-1 cursor-pointer">
                    <Wand2 className="w-4 h-4 text-primary" /> Sugerido por IA
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="mode-manual" />
                  <Label htmlFor="mode-manual" className="flex items-center gap-1 cursor-pointer">
                    <Edit3 className="w-4 h-4 text-primary" /> Manual
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div
              className={cn(
                'relative transition-all duration-500',
                mode === 'ai' ? 'opacity-90' : 'opacity-100',
              )}
            >
              <Textarea
                id="microTarefa"
                value={microTarefa}
                onChange={(e) => setMicroTarefa(e.target.value)}
                placeholder="Ex: Ligar para os 3 principais fornecedores para renegociar tabela..."
                maxLength={200}
                readOnly={mode === 'ai'}
                className={cn(
                  'min-h-[120px] resize-none text-base focus-visible:ring-secondary transition-colors duration-300',
                  mode === 'ai' &&
                    'bg-primary/5 border-primary/20 cursor-default focus-visible:ring-0',
                )}
              />
              {mode === 'manual' && (
                <div className="absolute bottom-3 right-3 text-xs font-medium text-muted-foreground animate-fade-in">
                  {microTarefa.length}/200
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-between gap-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              className="text-[#f7941e] border-[#f7941e] hover:bg-[#f7941e] hover:text-white transition-colors"
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
            </Button>
            <Button
              onClick={handleFinish}
              disabled={!microTarefa}
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:scale-105 transition-transform"
            >
              <Save className="mr-2 w-4 h-4" /> Finalizar Intervenção
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-secondary flex items-center gap-2">
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
            <Button onClick={proceedToFinish} className="w-full sm:w-auto bg-primary">
              Manter e Finalizar Mesmo Assim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
