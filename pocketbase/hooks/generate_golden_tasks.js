routerAdd(
  'POST',
  '/backend/v1/generate-golden-tasks',
  (e) => {
    const body = e.requestInfo().body || {}
    const fato = body.fato || 'Não informado'
    const dor = body.dor || 'Não informado'
    const desejo = body.desejo || 'Não informado'

    const prompt = `Atue como um consultor de negócios especialista em metodologia ágil.
Com base no seguinte diagnóstico do cliente:
Fato: ${fato}
Dor: ${dor}
Desejo: ${desejo}

Crie 3 sugestões diferentes de "Tarefa de Ouro" (Golden Task).
A Tarefa de Ouro deve ser UMA ÚNICA FRASE bem formulada seguindo estritamente os critérios SMART (Específica, Mensurável, Alcançável, Relevante e Temporal).

Retorne APENAS um JSON array de strings com as 3 sugestões, sem markdown, sem explicações adicionais, e nada de formatação com \`\`\`.
Exemplo: ["Aumentar as vendas em 20% em 30 dias", "Reduzir custos em 10% até o fim do trimestre", "Contratar 2 vendedores em 15 dias"]`

    let suggestions = [
      `Aumentar os resultados em 20% nos próximos 30 dias com base no diagnóstico.`,
      `Reduzir os impactos negativos mapeados em 15% até o final do semestre atual.`,
      `Implementar uma nova estrutura em até 45 dias para alcançar os objetivos esperados.`,
    ]

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
            suggestions = JSON.parse(content)
          } catch (err) {
            const match = content.match(/\[.*\]/s)
            if (match) {
              suggestions = JSON.parse(match[0])
            } else {
              suggestions = content
                .split('\n')
                .map((s) => s.replace(/^[-*0-9.]\s*/, '').trim())
                .filter((s) => s.length > 0)
                .slice(0, 3)
            }
          }
        }
      } catch (err) {
        $app.logger().error('AI Gateway Error', 'error', err.message)
      }
    }

    return e.json(200, { suggestions })
  },
  $apis.requireAuth(),
)
