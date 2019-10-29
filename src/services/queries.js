const Pool = require('pg').Pool
const pool = new Pool({
  user: 'iteamadmin',
  password: 'adminadmin1337',
  host: 'localhost',
  database: 'avvikelseboten',
  port: 5432,
})

const getUsers = async (request, response) => {
  await pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getReports = async data => {
  const { month, slack_id } = data
  idUpper = slack_id.toUpperCase()
  console.log(idUpper)

  return new Promise((resolve, reject) => { 
    pool.query(
    `SELECT * FROM public.deviates WHERE slack_id = '${idUpper}';`,
    (error, results) => {
      if (error) {
        throw error
      }
      resolve(results.rows)
    }
  )
  })
}

const createUser = async (data, response) => {
  const { name, slack_id } = request.body

  await pool.query(
    'INSERT INTO users (name, slack_id) VALUES ($1, $2)',
    [name, slack_id],
    (error, results) => {
      if (error) {
        throw error
      }
      console.log(results)
      response.status(201).send(`User added with ID: ${results.insertId}`)
    }
  )
}

const reportDeviation = async (data, response) => {
  const { hours, reason, project, slack_id, time } = data

  await pool.query(
    'INSERT INTO deviates (hours, reason, project, slack_id, time) VALUES ($1, $2, $3, $4, $5)',
    [hours, reason, project, slack_id, time],
    (error, results) => {
      if (error) {
        throw error
      }
    }
  )
}

module.exports = {
  getUsers,
  createUser,
  reportDeviation,
  getReports,
}
