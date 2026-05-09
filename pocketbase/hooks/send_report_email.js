routerAdd(
  'POST',
  '/backend/v1/send-report-email',
  (e) => {
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
    const estruturarData = record.get('estruturar_data') || {}

    const swot = estruturarData.swot || estruturarData
    const s = swot.strengths || swot.s || 'Não preenchido'
    const w = swot.weaknesses || swot.w || 'Não preenchido'
    const o = swot.opportunities || swot.o || 'Não preenchido'
    const t = swot.threats || swot.t || 'Não preenchido'
    const goldenTask = tarefaOuro || estruturarData.goldenTask || 'Não preenchido'

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
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #f2a900;">
            <p style="margin: 0;">${goldenTask}</p>
          </div>

          <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
            Gerado via Plataforma Consultoria Express Senac | Tempo de Intervenção: 20 min
          </p>
        </div>
      </div>
    `

    try {
      const message = new MailerMessage({
        from: {
          address: $app.settings().meta.senderAddress || 'noreply@senac.br',
          name: $app.settings().meta.senderName || 'Consultoria Express Senac',
        },
        to: [{ address: body.email }],
        subject: 'Seu Resumo de Consultoria Express Senac',
        html: html,
      })

      $app.newMailClient().send(message)

      $app
        .logger()
        .info('Email enviado com sucesso', 'consultancyId', body.consultancyId, 'to', body.email)
      return e.json(200, { success: true, message: 'E-mail enviado com sucesso' })
    } catch (err) {
      $app.logger().error('Erro ao enviar email', 'error', err.message || String(err))
      return e.badRequestError(
        'Falha ao enviar o e-mail. Verifique as configurações de SMTP da instância.',
        { error: err.message },
      )
    }
  },
  $apis.requireAuth(),
)
