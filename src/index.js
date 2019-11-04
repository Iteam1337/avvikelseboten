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

app.post('/actions', validateRequest, handleAction)
app.post('/list', validateRequest, listCommands)
app.post('/report', validateRequest, report)

app.listen(port, () => {
  console.log(`server up at ${port}`)
})
