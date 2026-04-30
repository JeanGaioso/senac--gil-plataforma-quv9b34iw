import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/use-session-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Save, Lightbulb } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function EscalarPage() {
  const { session, updateSession, finishSession } = useSessionStore()
  const navigate = useNavigate()

  const [microTarefa, setMicroTarefa] = useState(session.microTarefa)
  const [showModal, setShowModal] = useState(false)

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
            <Label htmlFor="microTarefa" className="text-lg font-bold flex items-center gap-2">
              Micro-Tarefa 24h
              <Lightbulb className="w-5 h-5 text-secondary" />
            </Label>
            <p className="text-sm text-muted-foreground">
              O que pode ser feito em até 24 horas para dar o primeiro passo em direção ao objetivo?
            </p>
            <Textarea
              id="microTarefa"
              value={microTarefa}
              onChange={(e) => setMicroTarefa(e.target.value)}
              placeholder="Ex: Ligar para os 3 principais fornecedores para renegociar tabela..."
              className="min-h-[120px] resize-none text-base focus-visible:ring-secondary"
            />
          </div>

          <div className="pt-4 flex justify-between border-t">
            <Button variant="outline" onClick={handleBack}>
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
