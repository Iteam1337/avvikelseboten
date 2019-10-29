const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const { handleAction, listCommands, report, displayPayloads } = require('./services/actions')

const port = 3000

app
  .use(cors())
  .use(bodyParser.json())
  .use(
    bodyParser.urlencoded({
      extended: true,
    })
  )

app.post('/actions', handleAction)
app.post('/list', listCommands)
app.post('/report', report)

app.listen(port, () => {
  console.log(`server up at ${port}`)
})
