import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getConsultancies, deleteConsultancy } from '@/services/consultancies'
import { useRealtime } from '@/hooks/use-realtime'
import { useSessionStore } from '@/stores/use-session-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Plus, Trash2, FileText, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function Dashboard() {
  const [consultancies, setConsultancies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { loadSession } = useSessionStore()

  const loadData = async () => {
    try {
      const data = await getConsultancies()
      setConsultancies(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('consultancies', () => {
    loadData()
  })

  const handleEdit = (c: any) => {
    const sData = c.sentir_data || {}
    const eData = c.estruturar_data || {}
    const escData = c.escalar_data || {}

    loadSession({
      consultancyId: c.id,
      clientName: c.client_name,
      consultantName: c.consultant_name,
      status: c.status,
      fato: sData.fato || '',
      dor: sData.dor || '',
      desejo: sData.desejo || '',
      strengths: eData.strengths || '',
      weaknesses: eData.weaknesses || '',
      opportunities: eData.opportunities || '',
      threats: eData.threats || '',
      goldenTask: c.tarefa_ouro || '',
      plan: escData.plan || [],
      microTarefa: escData.plan?.[0]?.title || '',
      startTime: Date.now(),
      isFinished: c.status === 'completed',
    })

    if (c.status === 'completed') {
      navigate('/resumo')
    } else {
      navigate('/sentir')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteConsultancy(id)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Meus Projetos</h1>
          <p className="text-muted-foreground">Gerencie suas sessões de consultoria ágil.</p>
        </div>
        <Button onClick={() => navigate('/nova')} className="shrink-0" size="lg">
          <Plus className="w-5 h-5 mr-2" /> Nova Consultoria
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-48 animate-pulse bg-muted/20" />
          ))}
        </div>
      ) : consultancies.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="mb-2">Nenhum projeto encontrado</CardTitle>
          <CardDescription className="mb-6 max-w-md">
            Você ainda não possui nenhuma consultoria cadastrada. Clique no botão abaixo para
            iniciar sua primeira intervenção.
          </CardDescription>
          <Button onClick={() => navigate('/nova')}>
            <Plus className="w-4 h-4 mr-2" /> Criar Projeto
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {consultancies.map((c) => (
            <Card key={c.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={c.status === 'completed' ? 'default' : 'secondary'}>
                    {c.status === 'completed' ? 'Concluído' : 'Rascunho'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(c.created), 'dd/MM/yyyy')}
                  </span>
                </div>
                <CardTitle className="text-xl line-clamp-1" title={c.client_name}>
                  {c.client_name}
                </CardTitle>
                <CardDescription>Consultor: {c.consultant_name}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-4 flex items-center justify-between border-t gap-2">
                <Button
                  variant={c.status === 'completed' ? 'outline' : 'default'}
                  className="flex-1"
                  onClick={() => handleEdit(c)}
                >
                  {c.status === 'completed' ? (
                    <>
                      <FileText className="w-4 h-4 mr-2" /> Resumo
                    </>
                  ) : (
                    <>
                      Continuar <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Consultoria?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o projeto de
                        <strong className="ml-1">{c.client_name}</strong> e todos os dados
                        associados.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleDelete(c.id)}
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
