exports.up = pgm => {
  pgm.addColumns('users', {
      name: {
      type: 'varchar(50)',
    },
  })
}

exports.down = pgm => {
  pgm.dropColumns('users', ['name'])
}
