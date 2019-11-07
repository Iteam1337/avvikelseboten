const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const { handleAction, listCommands, report } = require('./services/actions')
const { validateRequest } = require('./services/auth')

const port = 3000

app
  .use(cors())
  .use(bodyParser.json())
  .use(
    bodyParser.urlencoded({
      extended: true,
    })
  )


app.listen(port, () => {
  console.log(`server up at ${port}`)
})
