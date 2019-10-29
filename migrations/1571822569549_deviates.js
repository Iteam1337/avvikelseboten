exports.up = pgm => {
  pgm.createExtension('uuid-ossp', { ifNotExists: true })
  return pgm.createTable('deviates', {
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
    project: {
      type: 'varchar(50)',
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

exports.down = pgm => pgm.dropTable('deviates')
