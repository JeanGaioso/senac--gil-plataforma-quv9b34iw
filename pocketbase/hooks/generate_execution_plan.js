routerAdd(
  'POST',
  '/backend/v1/generate-execution-plan',
  (e) => {
    const body = e.requestInfo().body || {}
    const { consultantName, clientName, goldenTask, swot } = body

    const prompt = `Atue como um consultor estratégico Sênior. 
Crie um Plano de Execução (Fase Escalar) pragmático para o cliente.
Contexto:
Consultor: ${consultantName || 'Não informado'}
Cliente: ${clientName || 'Não informado'}
Tarefa de Ouro (Objetivo Principal): ${goldenTask || 'Não informado'}
Análise SWOT: 
- Forças: ${swot?.strengths || 'N/A'}
- Fraquezas: ${swot?.weaknesses || 'N/A'}
- Oportunidades: ${swot?.opportunities || 'N/A'}
- Ameaças: ${swot?.threats || 'N/A'}

Gere um plano de ação direto, focado na Tarefa de Ouro.
Retorne APENAS um JSON no seguinte formato exato (NENHUM markdown, NENHUMA explicação adicional):
{
  "plan": [
    { "title": "Título da ação", "description": "O que fazer detalhadamente", "timeframe": "24 horas" },
    { "title": "Outra ação", "description": "Detalhes...", "timeframe": "7 dias" }
  ]
}
A primeira ação DEVE ser uma micro-tarefa para as próximas 24 horas.`

    let plan = [
      {
        title: 'Revisar a Tarefa de Ouro',
        description: 'Iniciar o planejamento tático imediatamente.',
        timeframe: '24 horas',
      },
    ]

    const apiKey = $secrets.get('OPENAI_API_KEY')

    if (!apiKey) {
      return e.internalServerError('Configuração de IA ausente no servidor.')
    }

    try {
      const res = $http.send({
        url: 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + apiKey,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
        }),
        timeout: 45,
      })

      const json = res.json
      if (json && json.choices && json.choices.length > 0) {
        const content = json.choices[0].message.content.trim()
        try {
          const parsed = JSON.parse(content)
          if (parsed.plan && Array.isArray(parsed.plan)) {
            plan = parsed.plan
          }
        } catch (err) {
          const match = content.match(/\{[\s\S]*\}/)
          if (match) {
            try {
              const parsedMatch = JSON.parse(match[0])
              if (parsedMatch.plan && Array.isArray(parsedMatch.plan)) plan = parsedMatch.plan
            } catch (e2) {}
          }
        }
      } else {
        return e.internalServerError('Falha na resposta do motor de IA.')
      }
    } catch (err) {
      $app.logger().error('OpenAI API Error (Execution Plan)', 'error', err.message)
      return e.internalServerError('Não foi possível conectar ao motor de IA.')
    }

    return e.json(200, { plan })
  },
  $apis.requireAuth(),
)
