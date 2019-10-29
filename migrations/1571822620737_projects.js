exports.up = pgm => {
  pgm.createExtension('uuid-ossp', { ifNotExists: true })
  return pgm.createTable('projects', {
    id: {
      type: 'uuid',
      default: pgm.func('uuid_generate_v4()'),
      notNull: true,
    },
    name: {
      type: 'varchar(50)',
    },
    hours: {
      type: 'int',
    },
    reason: {
      type: 'varchar(50)',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  })
}

exports.down = pgm => pgm.dropTable('projects')