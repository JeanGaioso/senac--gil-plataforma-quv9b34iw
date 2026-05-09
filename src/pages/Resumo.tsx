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
        @page { size: A4; margin: 1cm; }
        body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.2; margin: 0; padding: 0; font-size: 10pt; }
        .header-bg { background-color: #004BB5; color: #ffffff; padding: 12px; margin-bottom: 10px; border-radius: 6px; }
        .header-bg h1 { margin: 0; color: #ffffff; font-size: 16px; text-transform: uppercase; }
        .header-bg p { margin: 2px 0 0 0; color: #ffffff; font-size: 11px; opacity: 0.9; }
        h1, h2, h3, h4 { color: #004BB5; margin-top: 0; margin-bottom: 4px; }
        .text-secondary { color: #F7941E !important; }
        .bg-secondary { background-color: #F7941E; color: #fff; padding: 2px 6px; border-radius: 8px; font-size: 11px; margin-right: 6px; }
        .bg-primary { background-color: #004BB5; color: #fff; padding: 2px 6px; border-radius: 8px; font-size: 11px; margin-right: 6px; }
        .section { margin-bottom: 10px; }
        .section h2 { font-size: 13px; margin-bottom: 6px; }
        .grid { display: table; width: 100%; table-layout: fixed; margin-bottom: 6px; }
        .col { display: table-cell; padding-right: 10px; vertical-align: top; width: 33%; }
        .col h4 { font-size: 11px; margin-bottom: 2px; }
        .col p { font-size: 10pt; margin-top: 0; margin-bottom: 0; }
        .box { background-color: #f4f8fb; padding: 8px; border-left: 3px solid #004BB5; margin: 6px 0; border-radius: 0 6px 6px 0; }
        .box h3 { font-size: 12px; margin-bottom: 4px; }
        .box p { font-size: 10pt; margin: 0; font-weight: bold; }
        .box-secondary { background-color: #fff6e8; padding: 8px; border-left: 3px solid #F7941E; margin: 6px 0; border-radius: 0 6px 6px 0; }
        .box-secondary h3 { font-size: 12px; margin-bottom: 4px; }
        .box-secondary p { font-size: 10pt; margin: 0; font-weight: bold; }
        hr { border: 0; border-bottom: 1px solid rgba(0,75,181,0.2); margin: 10px 0; }
      </style>
    </head><body>`

    const footer = `</body></html>`

    const content = `
      <div class="header-bg">
        <h1>Canvas Senac-Ágil</h1>
        <p>Metodologia Sentir, Estruturar, Escalar</p>
        <div style="margin-top: 6px; font-size: 10px;">
          <p style="margin: 0;"><strong>Cliente:</strong> ${session.clientName || 'Não informado'} | <strong>Consultor:</strong> ${session.consultantName || 'Não informado'} | <strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
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
            <p>${session.strengths || 'Não preenchido'}</p>
          </div>
          <div class="col">
            <h4>Fraquezas</h4>
            <p>${session.weaknesses || 'Não preenchido'}</p>
          </div>
          <div class="col">
            <h4>Ameaças / Riscos</h4>
            <p>${session.threats || 'Não preenchido'}</p>
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
          <p>${session.microTarefa || 'Não preenchido'}</p>
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
    <div className="space-y-1 print:space-y-0.5 print-section">
      <h3 className="font-bold text-primary flex items-center gap-1.5 border-b border-primary/20 pb-0.5 text-sm print:text-[11px]">
        <Icon className="w-3.5 h-3.5 text-secondary print:w-3 print:h-3" /> {title}
      </h3>
      <p className="text-sm print:text-[10px] text-gray-700 whitespace-pre-wrap leading-tight print-text">
        {content || 'Não preenchido'}
      </p>
    </div>
  )

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 1cm; }
          body { font-size: 10pt; background-color: white !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-container { padding: 0 !important; margin: 0 !important; }
          .print-card { box-shadow: none !important; border: none !important; margin: 0 !important; }
          .print-header { padding: 0.5rem 0.75rem !important; }
        }
      `}</style>
      <div className="space-y-6 animate-fade-in print-container print:space-y-3 w-full">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 print:hidden mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Intervenção Concluída</h1>
            <p className="text-muted-foreground">
              Aqui está o resumo executivo do seu diagnóstico.
            </p>
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

        <Card className="w-full bg-white shadow-xl print-card rounded-xl overflow-hidden border-2 border-primary/10">
          <div className="bg-primary text-white p-5 print-header flex justify-between items-end">
            <div>
              <h2 className="text-2xl print:text-lg font-bold tracking-tight uppercase flex items-center gap-2">
                <span className="w-1.5 h-6 print:h-4 bg-secondary rounded-full inline-block mr-1"></span>
                Canvas Senac-Ágil
              </h2>
              <p className="opacity-90 mt-1 pl-3.5 print:text-[10px] text-sm">
                Metodologia Sentir, Estruturar, Escalar
              </p>
            </div>
            <div className="text-right text-sm print:text-[9px] opacity-90 leading-tight">
              <p>
                <strong>Cliente:</strong> {session.clientName || 'Não informado'}
              </p>
              <p>
                <strong>Consultor:</strong> {session.consultantName || 'Não informado'}
              </p>
              <p>
                <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <CardContent className="p-6 print:p-3 space-y-6 print:space-y-3">
            <div>
              <h3 className="text-lg print:text-sm font-bold text-primary mb-3 print:mb-2 flex items-center gap-2">
                <span className="bg-primary text-white w-5 h-5 print:w-4 print:h-4 rounded-full inline-flex items-center justify-center text-xs print:text-[10px]">
                  1
                </span>
                Sentir (Diagnóstico)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-5 print:gap-3">
                <Section title="Fato" content={session.fato} icon={FileText} />
                <Section title="Dor" content={session.dor} icon={FileText} />
                <Section title="Desejo" content={session.desejo} icon={FileText} />
              </div>
            </div>

            <Separator className="bg-primary/20 print:my-1" />

            <div>
              <h3 className="text-lg print:text-sm font-bold text-primary mb-3 print:mb-2 flex items-center gap-2">
                <span className="bg-primary text-white w-5 h-5 print:w-4 print:h-4 rounded-full inline-flex items-center justify-center text-xs print:text-[10px]">
                  2
                </span>
                Estruturar (Estratégia)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-5 print:gap-3 mb-4 print:mb-2">
                <Section
                  title="Pontos Fortes"
                  content={session.strengths || ''}
                  icon={CheckCircle}
                />
                <Section title="Fraquezas" content={session.weaknesses || ''} icon={CheckCircle} />
                <Section
                  title="Ameaças / Riscos"
                  content={session.threats || ''}
                  icon={CheckCircle}
                />
              </div>
              <div className="bg-primary/5 rounded-lg p-4 print:p-2.5 border-l-4 border-primary">
                <h4 className="text-base print:text-[12px] font-bold text-primary flex items-center gap-2 mb-1.5 print:mb-1">
                  <Briefcase className="w-4 h-4 print:w-3 print:h-3 text-secondary" /> Tarefa de
                  Ouro
                </h4>
                <p className="text-sm print:text-[11px] text-gray-800 font-medium whitespace-pre-wrap leading-tight">
                  {session.goldenTask || 'Não preenchido'}
                </p>
              </div>
            </div>

            <Separator className="bg-primary/20 print:my-1" />

            <div>
              <h3 className="text-lg print:text-sm font-bold text-secondary mb-3 print:mb-2 flex items-center gap-2">
                <span className="bg-secondary text-white w-5 h-5 print:w-4 print:h-4 rounded-full inline-flex items-center justify-center text-xs print:text-[10px]">
                  3
                </span>
                Escalar (Execução)
              </h3>
              <div className="bg-secondary/10 rounded-lg p-4 print:p-2.5 border-l-4 border-secondary">
                <h4 className="text-base print:text-[12px] font-bold text-secondary flex items-center gap-2 mb-1.5 print:mb-1">
                  <RefreshCcw className="w-4 h-4 print:w-3 print:h-3" /> Micro-Tarefa 24h
                </h4>
                <p className="text-sm print:text-[11px] text-gray-900 font-bold whitespace-pre-wrap leading-tight">
                  {session.microTarefa || 'Não preenchido'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-[9px] text-muted-foreground print:block hidden mt-2 font-medium">
          Gerado via Plataforma Senac-Ágil | Tempo de Intervenção: 20 min
        </div>
      </div>
    </>
  )
}
