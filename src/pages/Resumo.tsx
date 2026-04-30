import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/use-session-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Printer,
  RefreshCcw,
  Briefcase,
  FileText,
  CheckCircle,
  Download,
  ArrowLeft,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default function ResumoPage() {
  const { session, resetSession } = useSessionStore()
  const navigate = useNavigate()

  const handleNewSession = () => {
    resetSession()
    navigate('/')
  }

  const exportToWord = () => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Senac-Ágil Canvas</title>
      <style>
        body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.6; margin: 20px; }
        .header-bg { background-color: #004BB5; color: #ffffff; padding: 20px; margin-bottom: 20px; border-radius: 8px; }
        .header-bg h1 { margin: 0; color: #ffffff; font-size: 24px; text-transform: uppercase; }
        .header-bg p { margin: 4px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9; }
        h1, h2, h3, h4 { color: #004BB5; margin-top: 0; }
        .text-secondary { color: #F7941E; }
        .bg-secondary { background-color: #F7941E; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 14px; margin-right: 8px; }
        .bg-primary { background-color: #004BB5; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 14px; margin-right: 8px; }
        .section { margin-bottom: 24px; }
        .grid { display: table; width: 100%; table-layout: fixed; margin-bottom: 16px; }
        .col { display: table-cell; padding-right: 16px; vertical-align: top; }
        .box { background-color: #f4f8fb; padding: 16px; border-left: 4px solid #004BB5; margin: 12px 0; border-radius: 0 8px 8px 0; }
        .box-secondary { background-color: #fff6e8; padding: 16px; border-left: 4px solid #F7941E; margin: 12px 0; border-radius: 0 8px 8px 0; }
        hr { border: 0; border-bottom: 1px solid rgba(0,75,181,0.2); margin: 20px 0; }
      </style>
    </head><body>`

    const footer = `</body></html>`

    const content = `
      <div class="header-bg">
        <h1>Canvas Senac-Ágil</h1>
        <p>Metodologia Sentir, Estruturar, Escalar</p>
        <div style="margin-top: 16px; font-size: 12px;">
          <p><strong>Cliente:</strong> ${session.clientName || 'Não informado'} | <strong>Consultor ID:</strong> ${session.consultantId || 'Não informado'} | <strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
      
      <div class="section">
        <h2><span class="bg-primary">1</span> Sentir (Diagnóstico)</h2>
        <div class="grid">
          <div class="col">
            <h4>Fato</h4>
            <p>${session.fato || 'Não preenchido'}</p>
          </div>
          <div class="col">
            <h4>Dor</h4>
            <p>${session.dor || 'Não preenchido'}</p>
          </div>
          <div class="col">
            <h4>Desejo</h4>
            <p>${session.desejo || 'Não preenchido'}</p>
          </div>
        </div>
      </div>

      <hr />

      <div class="section">
        <h2><span class="bg-primary">2</span> Estruturar (Estratégia)</h2>
        <div class="grid">
          <div class="col">
            <h4>Pontos Fortes</h4>
            <p>${session.pontosFortes || 'Não preenchido'}</p>
          </div>
          <div class="col">
            <h4>Riscos</h4>
            <p>${session.riscos || 'Não preenchido'}</p>
          </div>
          <div class="col">
            <h4>KPIs (Métricas)</h4>
            <p>${session.kpis || 'Não preenchido'}</p>
          </div>
        </div>
        <div class="box">
          <h3>Tarefa de Ouro</h3>
          <p>${session.goldenTask || 'Não preenchido'}</p>
        </div>
      </div>

      <hr />

      <div class="section">
        <h2 class="text-secondary"><span class="bg-secondary">3</span> Escalar (Execução)</h2>
        <div class="box-secondary">
          <h3 class="text-secondary">Micro-Tarefa 24h</h3>
          <p><strong>${session.microTarefa || 'Não preenchido'}</strong></p>
        </div>
      </div>
    `

    const sourceHTML = header + content + footer
    const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Senac_Agil_Canvas_${session.clientName ? session.clientName.replace(/\s+/g, '_') : 'Cliente'}.doc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
      <h3 className="font-bold text-primary flex items-center gap-2 border-b border-primary/20 pb-1">
        <Icon className="w-4 h-4 text-secondary" /> {title}
      </h3>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{content || 'Não preenchido'}</p>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in print:m-0 w-full print:p-0">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 print:hidden mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Intervenção Concluída</h1>
          <p className="text-muted-foreground">Aqui está o resumo executivo do seu diagnóstico.</p>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 w-full xl:w-auto mt-2 xl:mt-0">
          <Button
            variant="outline"
            onClick={() => navigate('/escalar')}
            className="border-primary text-primary hover:bg-primary hover:text-white transition-colors"
          >
            <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="border-primary text-primary hover:bg-primary hover:text-white transition-colors"
          >
            <Printer className="mr-2 w-4 h-4" /> PDF
          </Button>
          <Button
            variant="outline"
            onClick={exportToWord}
            className="border-primary text-primary hover:bg-primary hover:text-white transition-colors"
          >
            <Download className="mr-2 w-4 h-4" /> Word
          </Button>
          <Button
            onClick={handleNewSession}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <RefreshCcw className="mr-2 w-4 h-4" /> Nova Sessão
          </Button>
        </div>
      </div>

      <Card className="w-full bg-white shadow-xl print:shadow-none print:border-none rounded-xl overflow-hidden border-2 border-primary/10 print:![color-adjust:exact] print:![-webkit-print-color-adjust:exact]">
        <div className="bg-primary text-white p-6 flex justify-between items-end print:bg-primary print:text-white print:border-b-2 print:border-primary">
          <div>
            <h2 className="text-2xl font-bold tracking-tight uppercase flex items-center gap-2 print:text-white">
              <span className="w-2 h-8 bg-secondary rounded-full inline-block mr-1 print:bg-secondary"></span>
              Canvas Senac-Ágil
            </h2>
            <p className="opacity-90 mt-1 pl-4 print:text-white">
              Metodologia Sentir, Estruturar, Escalar
            </p>
          </div>
          <div className="text-right text-sm opacity-90 print:text-white">
            <p>
              <strong>Cliente:</strong> {session.clientName || 'Não informado'}
            </p>
            <p>
              <strong>Consultor ID:</strong> {session.consultantId || 'Não informado'}
            </p>
            <p>
              <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <CardContent className="p-6 md:p-8 space-y-8 print:p-4">
          <div>
            <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <span className="bg-primary text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm print:bg-primary print:text-white">
                1
              </span>
              Sentir (Diagnóstico)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-6">
              <Section title="Fato" content={session.fato} icon={FileText} />
              <Section title="Dor" content={session.dor} icon={FileText} />
              <Section title="Desejo" content={session.desejo} icon={FileText} />
            </div>
          </div>

          <Separator className="bg-primary/20" />

          <div>
            <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <span className="bg-primary text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm print:bg-primary print:text-white">
                2
              </span>
              Estruturar (Estratégia)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-6 mb-6">
              <Section title="Pontos Fortes" content={session.pontosFortes} icon={CheckCircle} />
              <Section title="Riscos" content={session.riscos} icon={CheckCircle} />
              <Section title="KPIs (Métricas)" content={session.kpis} icon={CheckCircle} />
            </div>
            <div className="bg-primary/5 rounded-lg p-6 border-l-4 border-primary">
              <h4 className="text-lg font-bold text-primary flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-secondary" /> Tarefa de Ouro
              </h4>
              <p className="text-base text-gray-800 font-medium whitespace-pre-wrap">
                {session.goldenTask || 'Não preenchido'}
              </p>
            </div>
          </div>

          <Separator className="bg-primary/20" />

          <div>
            <h3 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2 print:text-secondary">
              <span className="bg-secondary text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm print:bg-secondary print:text-white">
                3
              </span>
              Escalar (Execução)
            </h3>
            <div className="bg-secondary/10 rounded-lg p-6 border-l-4 border-secondary print:bg-secondary/10">
              <h4 className="text-lg font-bold text-secondary flex items-center gap-2 mb-2 print:text-secondary">
                <RefreshCcw className="w-5 h-5 print:text-secondary" /> Micro-Tarefa 24h
              </h4>
              <p className="text-base text-gray-900 font-bold whitespace-pre-wrap">
                {session.microTarefa || 'Não preenchido'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground print:block hidden mt-8 font-medium">
        Gerado via Plataforma Senac-Ágil | Tempo de Intervenção: 20 min
      </div>
    </div>
  )
}
