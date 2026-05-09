routerAdd(
  'POST',
  '/backend/v1/send-report-email',
  (e) => {
    const pkg = 'mailer'
    const mailer = require(pkg)
    const body = e.requestInfo().body
    if (!body.consultancyId || !body.email) {
      return e.badRequestError('Consultancy ID e E-mail são obrigatórios.')
    }

    let record
    try {
      record = $app.findRecordById('consultancies', body.consultancyId)
    } catch (err) {
      return e.notFoundError('Consultoria não encontrada.')
    }

    const consultantName = record.getString('consultant_name') || 'Consultor'
    const clientName = record.getString('client_name') || 'Cliente'
    const tarefaOuro = record.getString('tarefa_ouro') || ''
    const sentirData = record.get('sentir_data') || {}
    const estruturarData = record.get('estruturar_data') || {}
    const escalarData = record.get('escalar_data') || {}

    const fato = sentirData.fato || 'Não preenchido'
    const dor = sentirData.dor || 'Não preenchido'
    const desejo = sentirData.desejo || 'Não preenchido'

    const swot = estruturarData.swot || estruturarData
    const s = swot.strengths || swot.s || 'Não preenchido'
    const w = swot.weaknesses || swot.w || 'Não preenchido'
    const o = swot.opportunities || swot.o || 'Não preenchido'
    const t = swot.threats || swot.t || 'Não preenchido'
    const goldenTask = tarefaOuro || estruturarData.goldenTask || 'Não preenchido'

    const plan = Array.isArray(escalarData) ? escalarData : escalarData.plan || []
    const microTarefa = escalarData.microTarefa || ''

    let escalarHtml = '<p>Não preenchido</p>'
    if (plan && plan.length > 0 && plan.some((p) => p.selected)) {
      escalarHtml = plan
        .filter((p) => p.selected)
        .map(
          (p) => `
        <div style="background-color: #f1f8ff; padding: 15px; border-left: 4px solid #004a8f; margin-bottom: 10px;">
          <h4 style="margin: 0 0 5px 0; color: #004a8f;">${p.title} <span style="font-size: 12px; background: #e0f0ff; padding: 2px 6px; border-radius: 10px; font-weight: normal; margin-left: 10px;">${p.timeframe}</span></h4>
          <p style="margin: 0; font-size: 14px;">${p.description}</p>
        </div>
      `,
        )
        .join('')
    } else if (microTarefa) {
      escalarHtml = `
        <div style="background-color: #f1f8ff; padding: 15px; border-left: 4px solid #004a8f; margin-bottom: 10px;">
          <h4 style="margin: 0 0 5px 0; color: #004a8f;">Micro-Tarefa 24h</h4>
          <p style="margin: 0; font-size: 14px;">${microTarefa}</p>
        </div>
      `
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #004a8f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Consultoria Express Senac</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Relatório de Intervenção Concluída</p>
        </div>
        
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Olá,</p>
          <p>Aqui está o resumo executivo do diagnóstico realizado.</p>
          
          <table style="width: 100%; margin-bottom: 20px;">
            <tr>
              <td><strong>Cliente:</strong> ${clientName}</td>
              <td><strong>Consultor:</strong> ${consultantName}</td>
            </tr>
          </table>

          <h3 style="color: #004a8f; border-bottom: 1px solid #eee; padding-bottom: 5px;">Sentir (Diagnóstico)</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px; background-color: #f9f9f9; border: 1px solid #eee;">
                <strong>Fato:</strong><br/>
                <span style="font-size: 14px;">${fato}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; background-color: #f9f9f9; border: 1px solid #eee;">
                <strong>Dor:</strong><br/>
                <span style="font-size: 14px;">${dor}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; background-color: #f9f9f9; border: 1px solid #eee;">
                <strong>Desejo:</strong><br/>
                <span style="font-size: 14px;">${desejo}</span>
              </td>
            </tr>
          </table>

          <h3 style="color: #004a8f; border-bottom: 1px solid #eee; padding-bottom: 5px;">Matriz SWOT</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="width: 50%; padding: 10px; background-color: #15B5C1; color: white; border: 2px solid white;">
                <strong>Forças (Strengths)</strong><br/>
                <span style="font-size: 14px;">${s}</span>
              </td>
              <td style="width: 50%; padding: 10px; background-color: #859D3D; color: white; border: 2px solid white;">
                <strong>Fraquezas (Weaknesses)</strong><br/>
                <span style="font-size: 14px;">${w}</span>
              </td>
            </tr>
            <tr>
              <td style="width: 50%; padding: 10px; background-color: #F58220; color: white; border: 2px solid white;">
                <strong>Oportunidades (Opportunities)</strong><br/>
                <span style="font-size: 14px;">${o}</span>
              </td>
              <td style="width: 50%; padding: 10px; background-color: #E32D43; color: white; border: 2px solid white;">
                <strong>Ameaças (Threats)</strong><br/>
                <span style="font-size: 14px;">${t}</span>
              </td>
            </tr>
          </table>

          <h3 style="color: #004a8f; border-bottom: 1px solid #eee; padding-bottom: 5px;">Tarefa de Ouro</h3>
          <div style="background-color: #fff8e1; padding: 15px; border-left: 4px solid #f2a900; margin-bottom: 20px;">
            <p style="margin: 0;">${goldenTask}</p>
          </div>

          <h3 style="color: #004a8f; border-bottom: 1px solid #eee; padding-bottom: 5px;">Escalar (Execução)</h3>
          ${escalarHtml}

          <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
            Gerado via Plataforma Consultoria Express Senac | Tempo de Intervenção: 20 min
          </p>
        </div>
      </div>
    `

    const host = $secrets.get('HOST')
    const port = parseInt($secrets.get('PORT') || '587', 10)
    const user = $secrets.get('USER')
    const pass = $secrets.get('PASSWORD')

    if (!host || !user || !pass) {
      return e.badRequestError('Configurações de SMTP ausentes nos Secrets do projeto.')
    }

    try {
      const message = new mailer.Message({
        from: {
          address: user,
          name: 'Consultoria Express Senac',
        },
        to: [{ address: body.email }],
        subject: 'Seu Resumo de Consultoria Express Senac',
        html: html,
      })

      const client = new mailer.SmtpClient({
        host: host,
        port: port,
        username: user,
        password: pass,
      })

      client.send(message)

      $app
        .logger()
        .info(
          'Email enviado com sucesso via SmtpClient',
          'consultancyId',
          body.consultancyId,
          'to',
          body.email,
        )

      return e.json(200, { success: true, message: 'E-mail enviado com sucesso' })
    } catch (err) {
      $app.logger().error('Erro ao enviar email SMTP', 'error', err.message || String(err))
      return e.badRequestError('Falha na autenticação ou conexão SMTP.', { error: err.message })
    }
  },
  $apis.requireAuth(),
)
