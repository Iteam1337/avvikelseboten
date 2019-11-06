const dotenv = require('dotenv')
dotenv.config()

const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
})

const getReports = data => {
  
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT * FROM deviations INNER JOIN projects ON project_id = projects.id WHERE time LIKE ($1) ORDER BY time ASC;`,
      [data+'%'],
      (error, results) => {
        if (error) {
          throw error
        }
        resolve(results.rows)
      }
    )
  })
}

const getAllUsers = data => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM public.users;`, (error, results) => {
      if (error) {
        throw error
      }
      resolve(results.rows)
    })
  })
}

const userGreeted = data => {
  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE public.users SET has_been_greeted = true WHERE slack_id = ($1);`,
      [data],
      (error, results) => {
        if (error) {
          throw error
        }
        resolve(results.rows)
      }
    )
  })
}

const getUser = data => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT * FROM public.users WHERE slack_id = ($1);`,
      [data],
      (error, results) => {
        if (error) {
          throw error
        }
        resolve(results)
      }
    )
  })
}

const createUser = data => {
  return new Promise((resolve, reject) => {
    pool.query(
      'INSERT INTO users (slack_id) VALUES ($1);',
      [data],
      (error, results) => {
        if (error) {
          throw error
        }
        resolve(results.insertId)
      }
    )
  })
}

const reportDeviation = async (data, response) => {
  const { hours, reason, project_id, slack_id, time } = data

  await pool.query(
    'INSERT INTO deviations (hours, reason, project_id, slack_id, time) VALUES ($1, $2, $3, $4, $5)',
    [hours, reason, project_id, slack_id, time],
    (error, results) => {
      if (error) {
        throw error
      }
    }
  )
}

const createProject = async (data, response) => {
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
      `SELECT id FROM public.projects WHERE name = ($1);`,
      [project],
      (error, results) => {
        if (results && results.rowCount === 0) {
          resolve(undefined)
          return
        }
        // TODO DEN HÄR FUNKTIONEN KASTAR FATAL FEL NÄR MAN INTE HAR ETT PROJECT VID RÄTT NAMN
        resolve(results.rows[0].id)
      }
    )
  })
}

const getProjectById = (data, response) => {
  return new Promise(resolve => {
    const projectId = data
    pool.query(
      `SELECT name FROM public.projects WHERE id = ($1);`,
      [projectId],
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
  getUser,
  getAllUsers,
  userGreeted,
}
