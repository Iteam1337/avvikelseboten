const {
  reportDeviation,
  getReports,
  getProjectByName,
  createProject,
  getProjectById,
} = require('./queries')
const moment = require('moment')
const dotenv = require('dotenv')
dotenv.config()

const { listTemplate } = require('../templates/listTemplate')
const { reportTemplate } = require('../templates/reportTemplate')

const SlackBot = require('slackbots')
const bot = new SlackBot({
  token: `${process.env.SLACK_TOKEN}`,
  name: 'Avvikelseboten',
})

bot.on('start', () => {
  // bot.postMessageToChannel('general', 'I am live!')
})

bot.on('message', function(data) {
  if (data.type !== 'message') {
    return
  }
  if (data.subtitle === 'Avvikelseboten (bot)') {
    return
  }
  if (data.user) {
    bot
      .getUserById(data.user)
      .then((user, err) => {
        if (err) {
          console.error(err)
        }
        handleMessage(data, user)
      })
      .catch(e => console.error(e))
  }
})

async function handleMessage(data, user) {
  const slack_id = data.user
  const text = data.text
  const userName = user.name
  let message

  option = text.split(' ')

  if (text) {
    switch (option[0]) {
      case '--me':
        // DISPLAY CURRENT USER ID AND NAME
        bot.postMessageToUser(userName, `ID: ${slack_id} Name: ${userName}`)
        break

      case '--newProject':
        // POST REQUEST TO STORE A NEW PROJECT IN DATABASE
        let newProject = option[1]
        let createProjectData = {
          newProject,
        }
        try {
          await createProject(createProjectData)
          message = `${userName} created a new project: ${newProject}`
        } catch (err) {
          console.error(err)
          message = `Something went wrong: ${err}`
        }

        bot.postMessageToUser(userName, message)
        break

      case '--report':
        // POST REQUEST TO STORE A DEVIATION WITH FOLLOWING INFORMATION
        let hours = option[1]
        let reason = option[2]
        let project = option[3]

        let time = moment(option[4]).format('LL')

        let project_id = await getProjectByName(project)

        let reportData = {
          hours,
          reason,
          project_id,
          slack_id,
          time,
        }

        if ((hours, reason, time === undefined)) {
          message = 'One option was not reported correctly!'
        } else if (time === 'Invalid date') {
          message = 'You have to use a correct time-format (YYYY-MM-DD)'
        } else if (project_id === undefined) {
          message = "Couldn't find any project with that name"
        } else {
          message = `You just reported ${hours}h of ${reason} for project ${project} at the date of: ${time}!`
        }
        if (project_id) {
          try {
            await reportDeviation(reportData)
          } catch (err) {
            bot.postMessageToUser(`Something went wrong fetching data: ${err}`)
            console.error(err)
          }
        }

        bot.postMessageToUser(userName, message)
        break

      case '--update':
        // PUT REQUEST TO UPDATE SPECIFIC ROW ON USER TABLE - but why? IS THIS USEFUL?!

        let whatUpdate = option[1]
        let value = option[2]
        bot.postMessageToUser(
          userName,
          `you updated your ${whatUpdate} to: ${value}!`
        )
        break

      case '--checkout':
        // GET REQUEST TO FETCH ALL DEVIATIONS FOR CURRENT USER FOR QUERIED MONTH
        let month = option[1]
        let checkoutData = {
          month,
          slack_id,
        }

        const data = await getReports(checkoutData)
        let projectName
        for (i = 0; i < data.length; i++) {
          if (data) {
            projectName = await getProjectById(data[0].project_id)
          }
          bot.postMessageToUser(
            userName,
            `${data[i].time}\n
              ${data[i].hours}h, Reason: ${data[i].reason}, Project: ${data[i].name}!`
          )
        }
        break

      default:
        bot.postMessageToUser(
          userName,
          'Please use a valid command! Type /list to see all commands!'
        )
    }
  }
}

function handleAction(req, res, next) {
  res.send({
    challenge: req.body.challenge,
  })
}

function listCommands(req, res, next) {
  listTemplate(req, res)
}

function displayPayloads(req, res, next) {
  console.log(req, res)
}

function report(req, res, next) {
  reportTemplate(req, res)
}

module.exports = {
  handleAction,
  listCommands,
  report,
  displayPayloads,
}
