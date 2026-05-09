migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('consultancies')
    col.addIndex('idx_consultancies_user', false, 'user', '')
    col.addIndex('idx_consultancies_status', false, 'status', '')
    col.addIndex('idx_consultancies_created', false, 'created', '')
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('consultancies')
    col.removeIndex('idx_consultancies_user')
    col.removeIndex('idx_consultancies_status')
    col.removeIndex('idx_consultancies_created')
    app.save(col)
  },
)
