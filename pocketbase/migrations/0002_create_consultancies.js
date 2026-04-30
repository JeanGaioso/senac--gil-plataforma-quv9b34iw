migrate(
  (app) => {
    const collection = new Collection({
      name: 'consultancies',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'consultant_name', type: 'text', required: true },
        { name: 'client_name', type: 'text', required: true },
        { name: 'sentir_data', type: 'json' },
        { name: 'estruturar_data', type: 'json' },
        { name: 'tarefa_ouro', type: 'text' },
        { name: 'escalar_data', type: 'json' },
        { name: 'status', type: 'select', values: ['draft', 'completed'], required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('consultancies')
    app.delete(collection)
  },
)
