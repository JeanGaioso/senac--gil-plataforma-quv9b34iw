import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/use-session-store'
import { updateConsultancy } from '@/services/consultancies'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SentirPage() {
  const { session, updateSession } = useSessionStore()
  const navigate = useNavigate()

  const [fato, setFato] = useState(session.fato)
  const [dor, setDor] = useState(session.dor)
  const [desejo, setDesejo] = useState(session.desejo)
  const [error, setError] = useState('')

  const validate = () => {
    setError('')
    const genericTerms = [
      'melhorar tudo',
      'fazer mais',
      'aumentar vendas',
      'qualquer coisa',
      'bom',
      'ruim',
      'não sei',
      'nada',
      'vender mais',
      'crescer',
      'mais lucro',
      'melhorar o sistema',
      'arrumar tudo',
    ]
    const textToAnalyze = `${fato} ${dor} ${desejo}`.toLowerCase()

    if (genericTerms.some((term) => textToAnalyze.includes(term))) {
      setError('Seja mais específico para gerar resultados SMART. Evite termos genéricos.')
      return false
    }

    if (
      fato.trim().split(/\s+/).length < 3 ||
      dor.trim().split(/\s+/).length < 3 ||
      desejo.trim().split(/\s+/).length < 3
    ) {
      setError(
        'Por favor, seja mais descritivo. Use pelo menos 3 palavras em cada campo para dar contexto suficiente ao motor de IA.',
      )
      return false
    }

    return true
  }

  const handleNext = async () => {
    if (validate()) {
      if (session.consultancyId) {
        try {
          await updateConsultancy(session.consultancyId, {
            sentir_data: { fato, dor, desejo },
          })
        } catch (error) {
          console.error(error)
        }
      }
      updateSession({ fato, dor, desejo })
      navigate('/estruturar')
    }
  }

  const fields = [
    {
      id: 'fato',
      label: '1. Fato (O que está acontecendo?)',
      value: fato,
      setter: setFato,
      ph: 'Descreva a situação atual...',
    },
    {
      id: 'dor',
      label: '2. Dor (Qual é o problema principal?)',
      value: dor,
      setter: setDor,
      ph: 'Descreva os impactos negativos...',
    },
    {
      id: 'desejo',
      label: '3. Desejo (Qual o resultado esperado?)',
      value: desejo,
      setter: setDesejo,
      ph: 'Descreva a meta específica...',
    },
  ]

  return (
    <Card className="shadow-lg border-primary/10 animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Fase 1: Sentir (Diagnóstico)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive" className="animate-fade-in">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id} className="text-base font-semibold">
                {field.label}
              </Label>
              <Textarea
                id={field.id}
                maxLength={200}
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                placeholder={field.ph}
                className="resize-none h-24 focus-visible:ring-secondary"
              />
              <div className="text-xs text-muted-foreground text-right font-medium">
                {field.value.length}/200
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 flex justify-end border-t">
          <Button onClick={handleNext} size="lg" className="hover:scale-105 transition-transform">
            Avançar para Estruturar
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
