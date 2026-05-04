routerAdd(
  'POST',
  '/backend/v1/generate-swot',
  (e) => {
    const body = e.requestInfo().body || {}
    const fato = body.fato || 'Não informado'
    const dor = body.dor || 'Não informado'
    const desejo = body.desejo || 'Não informado'

    const prompt = `Você é um consultor estratégico Sênior. Sua tarefa é criar opções de Análise SWOT.
Diagnóstico atual:
- Fato: ${fato}
- Dor: ${dor}
- Desejo: ${desejo}

Gere 2 opções diferentes de Análise SWOT (Forças, Fraquezas, Oportunidades, Ameaças) relevantes para o contexto acima.
Retorne APENAS um array JSON válido com 2 objetos. Cada objeto deve ter a estrutura exata:
[
  {
    "strengths": "texto detalhando forças...",
    "weaknesses": "texto detalhando fraquezas...",
    "opportunities": "texto detalhando oportunidades...",
    "threats": "texto detalhando ameaças..."
  }
]
NENHUM markdown, NENHUMA formatação extra, NENHUMA explicação.`

    let suggestions = [
      {
        strengths: 'Equipe engajada, produto com diferencial competitivo.',
        weaknesses: 'Processos operacionais desestruturados, falta de métricas claras.',
        opportunities: 'Mercado em franca expansão e demanda por digitalização.',
        threats: 'Concorrência agressiva no mercado, mudanças regulatórias no setor.',
      },
      {
        strengths: 'Carteira de clientes fiel, marca estabelecida e reconhecida localmente.',
        weaknesses: 'Baixa adoção de tecnologia, dependência de poucos canais de venda.',
        opportunities: 'Estabelecimento de parcerias estratégicas, atuação em novos nichos.',
        threats: 'Instabilidade econômica, rápida entrada de novos competidores digitais.',
      },
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
            }
          }
        }
      } catch (err) {
        $app.logger().error('AI Gateway Error (SWOT)', 'error', err.message)
      }
    }

    return e.json(200, { suggestions })
  },
  $apis.requireAuth(),
)
