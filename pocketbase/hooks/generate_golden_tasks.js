routerAdd(
  'POST',
  '/backend/v1/generate-golden-tasks',
  (e) => {
    const body = e.requestInfo().body || {}
    const swot = body.swot || {}

    const prompt = `Você é um consultor estratégico Sênior. Sua tarefa é criar a "Tarefa de Ouro" (Golden Task) para um cliente.
Análise SWOT:
- Forças: ${swot.strengths || 'Não informado'}
- Fraquezas: ${swot.weaknesses || 'Não informado'}
- Oportunidades: ${swot.opportunities || 'Não informado'}
- Ameaças: ${swot.threats || 'Não informado'}

Gere APENAS UMA ÚNICA sugestão de "Tarefa de Ouro" altamente focada, contextual e baseada na metodologia SMART (Específica, Mensurável, Alcançável, Relevante e Temporal) baseada UNICAMENTE na análise SWOT fornecida.
A Tarefa de Ouro é o objetivo principal derivado desta análise. Deve ser UMA ÚNICA FRASE, acionável e direta.

Retorne APENAS um JSON com o seguinte formato:
{"task": "Sua sugestão de tarefa de ouro aqui"}
NENHUM markdown, NENHUMA explicação adicional.`

    let task = `Integrar as forças mapeadas para neutralizar as ameaças e alcançar o objetivo principal em 30 dias.`

    const apiKey = $secrets.get('SKIP_AI_GATEWAY_API_KEY')
    const baseUrl = $secrets.get('SKIP_AI_GATEWAY_URL')

    if (!apiKey || !baseUrl) {
      return e.internalServerError('Configuração de IA ausente no servidor.')
    }

    let url = baseUrl
    if (!url.endsWith('/')) url += '/'
    if (!url.endsWith('v1/')) url += 'v1/'
    url += 'chat/completions'

    try {
      const res = $http.send({
        url: url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + apiKey,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
        }),
        timeout: 30,
      })

      const json = res.json
      if (json && json.choices && json.choices.length > 0) {
        const content = json.choices[0].message.content.trim()
        try {
          const parsed = JSON.parse(content)
          if (parsed.task) {
            task = parsed.task
          } else {
            task = content
          }
        } catch (err) {
          const match = content.match(/\{[\s\S]*\}/)
          if (match) {
            try {
              const parsedMatch = JSON.parse(match[0])
              if (parsedMatch.task) task = parsedMatch.task
            } catch (e2) {}
          } else {
            task = content.replace(/["*{}]/g, '').trim()
          }
        }
      } else {
        return e.internalServerError('Falha na resposta do motor de IA.')
      }
    } catch (err) {
      $app.logger().error('OpenAI API Error (Golden Task)', 'error', err.message)
      return e.internalServerError('Não foi possível conectar ao motor de IA.')
    }

    return e.json(200, { task })
  },
  $apis.requireAuth(),
)
