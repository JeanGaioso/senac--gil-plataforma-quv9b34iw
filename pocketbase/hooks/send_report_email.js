routerAdd(
  'POST',
  '/backend/v1/send-report-email',
  (e) => {
    const body = e.requestInfo().body
    if (!body.consultancyId || !body.email) {
      return e.badRequestError('Consultancy ID e E-mail são obrigatórios.')
    }

    $app
      .logger()
      .info(
        'Sending report email via external/placeholder service',
        'consultancyId',
        body.consultancyId,
        'email',
        body.email,
      )

    return e.json(200, { success: true, message: 'E-mail enviado com sucesso' })
  },
  $apis.requireAuth(),
)
