migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'jeangaioso@gmail.com')
      return
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('jeangaioso@gmail.com')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Jean Gaioso')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'jeangaioso@gmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
