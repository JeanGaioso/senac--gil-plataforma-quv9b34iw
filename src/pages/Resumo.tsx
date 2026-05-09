import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/use-session-store'
import { sendReportEmail } from '@/services/consultancies'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Printer, RefreshCcw, Briefcase, FileText, Mail, ArrowLeft, Loader2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default function ResumoPage() {
  const { session, resetSession } = useSessionStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [emailOpen, setEmailOpen] = useState(false)
  const [clientEmail, setClientEmail] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)

  const handleNewSession = () => {
    resetSession()
    navigate('/')
  }

  const handleSendEmail = async () => {
    if (!clientEmail) {
      toast({ title: 'E-mail obrigatório', variant: 'destructive' })
      return
    }
    setSendingEmail(true)
    try {
      if (session.consultancyId) {
        await sendReportEmail(session.consultancyId, clientEmail)
        toast({ title: `E-mail enviado com sucesso via Resend!` })
        setEmailOpen(false)
      } else {
        throw new Error('Consultancy ID not found')
      }
    } catch (e: any) {
      console.error(e)
      const errorMsg = e.response?.message || e.message || 'Erro ao enviar e-mail'
      const detailMsg =
        e.response?.data?.smtp?.message ||
        e.response?.data?.validation?.message ||
        e.response?.data?.consultancy?.message ||
        ''

      toast({
        title: errorMsg,
        description: detailMsg
          ? `${String(detailMsg)} (Verifique o Bug Scanner para mais detalhes)`
          : 'Verifique o Bug Scanner ou a conexão SMTP.',
        variant: 'destructive',
      })
    } finally {
      setSendingEmail(false)
    }
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
              <Printer className="mr-2 w-4 h-4" /> Baixar PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => setEmailOpen(true)}
              className="border-primary text-primary hover:bg-primary hover:text-white transition-colors"
            >
              <Mail className="mr-2 w-4 h-4" /> Enviar E-mail
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
                Consultoria Express Senac
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

          <CardContent className="p-6 print:p-3 space-y-6 print:space-y-4">
            <div>
              <h3 className="text-lg print:text-sm font-bold text-primary mb-3 print:mb-2 flex items-center gap-2">
                <span className="bg-primary text-white w-5 h-5 print:w-4 print:h-4 rounded-full inline-flex items-center justify-center text-xs print:text-[10px]">
                  1
                </span>
                Sentir (Diagnóstico)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-5 print:gap-3">
                <Section title="Fato" content={session.fato || ''} icon={FileText} />
                <Section title="Dor" content={session.dor || ''} icon={FileText} />
                <Section title="Desejo" content={session.desejo || ''} icon={FileText} />
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

              <div className="grid grid-cols-[30px_1fr_1fr] md:grid-cols-[40px_1fr_1fr] gap-1 md:gap-2 mb-4 print:mb-2 print:gap-1 max-w-4xl mx-auto">
                <div className="col-start-2 bg-[#e6e6e6] text-slate-700 font-bold text-center py-1 md:py-2 rounded-t-lg text-xs md:text-sm print:text-[10px] print:py-1">
                  Fatores positivos
                </div>
                <div className="col-start-3 bg-[#b3b3b3] text-slate-700 font-bold text-center py-1 md:py-2 rounded-t-lg text-xs md:text-sm print:text-[10px] print:py-1">
                  Fatores negativos
                </div>

                <div
                  className="row-start-2 col-start-1 bg-[#e6e6e6] text-slate-700 font-bold flex items-center justify-center rounded-l-lg print:text-[10px] text-xs print:px-0"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  Fatores internos
                </div>

                <div className="row-start-2 col-start-2 bg-[#15B5C1] p-2 md:p-3 print:p-2 rounded-tl-lg flex flex-col gap-1">
                  <div className="flex items-center text-white mb-1">
                    <span className="text-2xl md:text-3xl font-black mr-1.5 print:text-xl">S</span>
                    <div className="leading-tight">
                      <span className="font-bold text-xs md:text-sm block print:text-[10px]">
                        Strengths
                      </span>
                    </div>
                  </div>
                  <p className="text-white text-xs md:text-sm whitespace-pre-wrap print:text-[10px] leading-tight">
                    {session.strengths || 'Não preenchido'}
                  </p>
                </div>

                <div className="row-start-2 col-start-3 bg-[#859D3D] p-2 md:p-3 print:p-2 rounded-tr-lg flex flex-col gap-1">
                  <div className="flex items-center text-white mb-1">
                    <span className="text-2xl md:text-3xl font-black mr-1.5 print:text-xl">W</span>
                    <div className="leading-tight">
                      <span className="font-bold text-xs md:text-sm block print:text-[10px]">
                        Weaknesses
                      </span>
                    </div>
                  </div>
                  <p className="text-white text-xs md:text-sm whitespace-pre-wrap print:text-[10px] leading-tight">
                    {session.weaknesses || 'Não preenchido'}
                  </p>
                </div>

                <div
                  className="row-start-3 col-start-1 bg-[#b3b3b3] text-slate-700 font-bold flex items-center justify-center rounded-l-lg py-2 print:text-[10px] text-xs print:px-0"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  Fatores externos
                </div>

                <div className="row-start-3 col-start-2 bg-[#F58220] p-2 md:p-3 print:p-2 rounded-bl-lg flex flex-col gap-1">
                  <div className="flex items-center text-white mb-1">
                    <span className="text-2xl md:text-3xl font-black mr-1.5 print:text-xl">O</span>
                    <div className="leading-tight">
                      <span className="font-bold text-xs md:text-sm block print:text-[10px]">
                        Opportunities
                      </span>
                    </div>
                  </div>
                  <p className="text-white text-xs md:text-sm whitespace-pre-wrap print:text-[10px] leading-tight">
                    {session.opportunities || 'Não preenchido'}
                  </p>
                </div>

                <div className="row-start-3 col-start-3 bg-[#E32D43] p-2 md:p-3 print:p-2 rounded-br-lg flex flex-col gap-1">
                  <div className="flex items-center text-white mb-1">
                    <span className="text-2xl md:text-3xl font-black mr-1.5 print:text-xl">T</span>
                    <div className="leading-tight">
                      <span className="font-bold text-xs md:text-sm block print:text-[10px]">
                        Threats
                      </span>
                    </div>
                  </div>
                  <p className="text-white text-xs md:text-sm whitespace-pre-wrap print:text-[10px] leading-tight">
                    {session.threats || 'Não preenchido'}
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-4 print:p-2.5 border-l-4 border-primary max-w-4xl mx-auto">
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
              <div className="grid grid-cols-1 gap-4 print:gap-2 max-w-4xl mx-auto">
                {session.plan && session.plan.filter((p: any) => p.selected).length > 0 ? (
                  session.plan
                    .filter((p: any) => p.selected)
                    .map((p: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-secondary/10 rounded-lg p-4 print:p-2.5 border-l-4 border-secondary"
                      >
                        <h4 className="text-base print:text-[12px] font-bold text-secondary flex items-center justify-between gap-2 mb-1.5 print:mb-1">
                          <span className="flex items-center gap-2">
                            <RefreshCcw className="w-4 h-4 print:w-3 print:h-3" /> {p.title}
                          </span>
                          <span className="text-xs print:text-[10px] bg-secondary/20 px-2 py-0.5 rounded-full">
                            {p.timeframe}
                          </span>
                        </h4>
                        <p className="text-sm print:text-[11px] text-gray-900 font-bold whitespace-pre-wrap leading-tight">
                          {p.description}
                        </p>
                      </div>
                    ))
                ) : (
                  <div className="bg-secondary/10 rounded-lg p-4 print:p-2.5 border-l-4 border-secondary">
                    <h4 className="text-base print:text-[12px] font-bold text-secondary flex items-center gap-2 mb-1.5 print:mb-1">
                      <RefreshCcw className="w-4 h-4 print:w-3 print:h-3" /> Micro-Tarefa 24h
                    </h4>
                    <p className="text-sm print:text-[11px] text-gray-900 font-bold whitespace-pre-wrap leading-tight">
                      {session.microTarefa || 'Não preenchido'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-[9px] text-muted-foreground print:block hidden mt-2 font-medium">
          Gerado via Plataforma Consultoria Express Senac | Tempo de Intervenção: 20 min
        </div>
      </div>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enviar relatório por E-mail</DialogTitle>
            <DialogDescription>
              Insira o e-mail do cliente para enviar o relatório da consultoria em PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-left">
                E-mail do Cliente
              </Label>
              <Input
                id="email"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="cliente@exemplo.com"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)} disabled={sendingEmail}>
              Cancelar
            </Button>
            <Button onClick={handleSendEmail} disabled={sendingEmail}>
              {sendingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar E-mail
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
