exports.up = pgm => {
  pgm.addColumns('users', {
      has_been_greeted: {
      type: 'Boolean',
      default: false,
    },
  })
}

exports.down = pgm => {
  pgm.dropColumns('users', ['has_been_greeted'])
}
