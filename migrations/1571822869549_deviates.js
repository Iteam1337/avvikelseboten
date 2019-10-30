exports.up = pgm => {
  pgm.createExtension('uuid-ossp', { ifNotExists: true })
  return pgm.createTable('deviations', {
    id: {
      type: 'uuid',
      default: pgm.func('uuid_generate_v4()'),
      notNull: true,
    },
    slack_id: {
      type: 'varchar(128)',
      notNull: true,
    },
    hours: {
      type: 'int',
    },
    reason: {
      type: 'varchar(50)',
    },
    project_id: {
      type: 'uuid',
      notNull: true,
      references: {
        schema: 'public',
        name: 'projects',
      },
    },
    time: {
      type: 'varchar(50)',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  })
}

exports.down = pgm => pgm.dropTable('deviations')
