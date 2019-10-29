const Pool = require('pg').Pool
const pool = new Pool({
  user: 'iteamadmin',
  password: 'adminadmin1337',
  host: 'localhost',
  database: 'avvikelseboten',
  port: 5432,
})

const getReports = data => {
  const { month, slack_id } = data
  idUpper = slack_id.toUpperCase()

  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT * FROM public.deviates INNER JOIN projects ON project_id = projects.id WHERE slack_id = '${idUpper}' AND time LIKE '${month}%' ORDER BY time ASC;`,
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
      response.status(201).send(`User added with ID: ${results.insertId}`)
    }
  )
}

const reportDeviation = async (data, response) => {
  const { hours, reason, project_id, slack_id, time } = data

  await pool.query(
    'INSERT INTO deviates (hours, reason, project_id, slack_id, time) VALUES ($1, $2, $3, $4, $5)',
    [hours, reason, project_id, slack_id, time],
    (error, results) => {
      if (error) {
        throw error
      }
    }
  )
}

const createProject = async (data, response) => {
  console.log(data)
  const { newProject } = data

  await pool.query(
    `INSERT INTO projects (name) VALUES ($1)`,
    [newProject],
    (error, results) => {
      if (error) {
        throw error
      }
    }
  )
}

const getProjectByName = (data, response) => {
  return new Promise(resolve => {
    const project = data
    pool.query(
      `SELECT id FROM public.projects WHERE name = '${project}';`,
      (error, results) => {
        if (error) {
          throw error
        }
        resolve(results.rows[0].id)
      }
    )
  })
}

const getProjectById = (data, response) => {
  return new Promise(resolve => {
    const projectId = data
    pool.query(
      `SELECT name FROM public.projects WHERE id = '${projectId}';`,
      (error, results) => {
        if (error) {
          throw error
        }
        resolve(results.rows[0].name)
      }
    )
  })
}

module.exports = {
  getProjectById,
  createUser,
  reportDeviation,
  getReports,
  getProjectByName,
  createProject,
}
