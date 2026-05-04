routerAdd(
  'POST',
  '/backend/v1/generate-golden-tasks',
  (e) => {
    const body = e.requestInfo().body || {}
    const fato = body.fato || 'Não informado'
    const dor = body.dor || 'Não informado'
    const desejo = body.desejo || 'Não informado'
    const swot = body.swot || {}

    const prompt = `Você é um consultor estratégico Sênior. Sua tarefa é criar a "Tarefa de Ouro" (Golden Task) para um cliente.
Diagnóstico atual:
- Fato: ${fato}
- Dor: ${dor}
- Desejo: ${desejo}

Análise SWOT:
- Forças: ${swot.strengths || 'Não informado'}
- Fraquezas: ${swot.weaknesses || 'Não informado'}
- Oportunidades: ${swot.opportunities || 'Não informado'}
- Ameaças: ${swot.threats || 'Não informado'}

Gere APENAS UMA ÚNICA sugestão de "Tarefa de Ouro" altamente focada, contextual e baseada na metodologia SMART (Específica, Mensurável, Alcançável, Relevante e Temporal).
A Tarefa de Ouro é o objetivo principal que resolverá a Dor e alcançará o Desejo partindo do Fato atual e integrando as informações estratégicas levantadas na análise SWOT. Deve ser UMA ÚNICA FRASE, acionável e direta.

Retorne APENAS um JSON com o seguinte formato:
{"task": "Sua sugestão de tarefa de ouro aqui"}
NENHUM markdown, NENHUMA explicação adicional.`

    let task = `Integrar as forças mapeadas para neutralizar as ameaças e alcançar o objetivo principal em 30 dias.`

    const url = $secrets.get('SKIP_AI_GATEWAY_URL')
    const apiKey = $secrets.get('SKIP_AI_GATEWAY_API_KEY')

    if (url && apiKey) {
      try {
        let endpoint = url
        if (!endpoint.endsWith('/v1/chat/completions')) {
          endpoint = endpoint + (endpoint.endsWith('/') ? '' : '/') + 'v1/chat/completions'
        }

        const res = $http.send({
          url: endpoint,
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
        }
      } catch (err) {
        $app.logger().error('AI Gateway Error (Golden Task)', 'error', err.message)
      }
    }

    return e.json(200, { task })
  },
  $apis.requireAuth(),
)
