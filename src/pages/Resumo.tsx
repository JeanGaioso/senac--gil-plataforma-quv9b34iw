import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/use-session-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Printer, RefreshCcw, Briefcase, FileText, CheckCircle } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default function ResumoPage() {
  const { session, resetSession } = useSessionStore()
  const navigate = useNavigate()

  const handleNewSession = () => {
    resetSession()
    navigate('/')
  }

  const Section = ({
    title,
    content,
    icon: Icon,
  }: {
    title: string
    content: string
    icon: any
  }) => (
    <div className="space-y-2">
      <h3 className="font-bold text-primary flex items-center gap-2 border-b pb-1">
        <Icon className="w-4 h-4" /> {title}
      </h3>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{content || 'Não preenchido'}</p>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in print:m-0 w-full">
      <div className="flex justify-between items-center print:hidden mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Intervenção Concluída</h1>
          <p className="text-muted-foreground">Aqui está o resumo executivo do seu diagnóstico.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.print()} className="hover:text-primary">
            <Printer className="mr-2 w-4 h-4" /> Exportar PDF
          </Button>
          <Button onClick={handleNewSession} className="bg-primary">
            <RefreshCcw className="mr-2 w-4 h-4" /> Nova Sessão
          </Button>
        </div>
      </div>

      <Card className="w-full bg-white shadow-xl print:shadow-none print:border-none rounded-xl overflow-hidden border-2 border-primary/10">
        <div className="bg-primary text-white p-6 flex justify-between items-end print:bg-white print:text-black print:border-b-2 print:border-primary">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Canvas Senac-Ágil</h2>
            <p className="opacity-90 mt-1">Metodologia Sentir, Estruturar, Escalar</p>
          </div>
          <div className="text-right text-sm opacity-90">
            <p>
              <strong>Cliente:</strong> {session.clientName}
            </p>
            <p>
              <strong>Consultor ID:</strong> {session.consultantId}
            </p>
            <p>
              <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <CardContent className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Section title="Fato" content={session.fato} icon={FileText} />
            <Section title="Dor" content={session.dor} icon={FileText} />
            <Section title="Desejo" content={session.desejo} icon={FileText} />
          </div>

          <Separator className="bg-primary/20" />

          <div className="bg-primary/5 rounded-lg p-6 border border-primary/10">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2 mb-3">
              <Briefcase className="w-5 h-5 text-secondary" /> Tarefa de Ouro (Estratégia Central)
            </h3>
            <p className="text-base text-gray-800 font-medium whitespace-pre-wrap">
              {session.goldenTask}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Section title="Pontos Fortes" content={session.pontosFortes} icon={CheckCircle} />
            <Section title="Riscos" content={session.riscos} icon={CheckCircle} />
            <Section title="KPIs (Métricas)" content={session.kpis} icon={CheckCircle} />
          </div>

          <Separator className="bg-primary/20" />

          <div className="bg-secondary/10 rounded-lg p-6 border border-secondary/20">
            <h3 className="text-lg font-bold text-secondary-foreground flex items-center gap-2 mb-3">
              <RefreshCcw className="w-5 h-5" /> Micro-Tarefa 24h (Plano de Ação Imediato)
            </h3>
            <p className="text-base text-gray-900 font-bold whitespace-pre-wrap">
              {session.microTarefa}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground print:block hidden mt-8">
        Gerado via Plataforma Senac-Ágil | Tempo de Intervenção: 20 min
      </div>
    </div>
  )
}
