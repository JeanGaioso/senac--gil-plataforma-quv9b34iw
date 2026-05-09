migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'jeangaioso@gmail.com')
    } catch (_) {
      user = new Record(users)
      user.setEmail('jeangaioso@gmail.com')
      user.setPassword('Skip@Pass')
      user.setVerified(true)
      user.set('name', 'Jean Gaioso')
      app.save(user)
    }

    const consultancies = app.findCollectionByNameOrId('consultancies')

    // Seed 1: Completed
    try {
      app.findFirstRecordByData('consultancies', 'client_name', 'Padaria Central')
    } catch (_) {
      const r1 = new Record(consultancies)
      r1.set('user', user.id)
      r1.set('consultant_name', 'Jean Gaioso')
      r1.set('client_name', 'Padaria Central')
      r1.set('status', 'completed')
      r1.set('sentir_data', {
        fato: 'Queda de vendas',
        dor: 'Menor fluxo de clientes',
        desejo: 'Aumentar faturamento',
      })
      r1.set('estruturar_data', {
        strengths: 'Bom produto',
        weaknesses: 'Marketing ruim',
        opportunities: 'Delivery',
        threats: 'Concorrente novo',
      })
      r1.set('tarefa_ouro', 'Implementar sistema de delivery no WhatsApp.')
      r1.set('escalar_data', {
        plan: [
          {
            title: 'Criar catálogo',
            timeframe: '24h',
            description: 'Fotos e preços no WA Business',
          },
        ],
      })
      app.save(r1)
    }

    // Seed 2: Draft
    try {
      app.findFirstRecordByData('consultancies', 'client_name', 'Oficina do João')
    } catch (_) {
      const r2 = new Record(consultancies)
      r2.set('user', user.id)
      r2.set('consultant_name', 'Jean Gaioso')
      r2.set('client_name', 'Oficina do João')
      r2.set('status', 'draft')
      r2.set('sentir_data', {
        fato: 'Muitos atrasos',
        dor: 'Clientes reclamando',
        desejo: 'Organizar fluxo de trabalho',
      })
      app.save(r2)
    }
  },
  (app) => {
    try {
      const r1 = app.findFirstRecordByData('consultancies', 'client_name', 'Padaria Central')
      app.delete(r1)
    } catch (_) {}

    try {
      const r2 = app.findFirstRecordByData('consultancies', 'client_name', 'Oficina do João')
      app.delete(r2)
    } catch (_) {}
  },
)
