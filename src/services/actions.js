const {
  reportDeviation,
  getReports,
  getProjectByName,
  createProject,
  getProjectById,
  createUser,
  getUser,
  getAllUsers,
  userGreeted,
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

// async function userExists(slack_id, name) {
//   const exists = await createUser(slack_id)

//   if (exists.rowCount === 0) {
//     try {
//       await createUser(slack_id, name)
//     } catch (err) {
//       throw new Error('Something went wrong when trying to add user: ', err)
//     }
//   }
// }

async function handleMessage(data, user) {
  const slack_id = data.user
  const text = data.text
  const userName = user.name
  let message

  option = text.split(' ')

  if (text) {
    switch (option[0].toUpperCase()) {
      case 'ME':
        // DISPLAY CURRENT USER ID AND NAME
        bot.postMessageToUser(userName, `ID: ${slack_id} Name: ${userName}`)
        break

      case 'ADD':
        // ADD USER TO DATABASE
        const exists = await getUser(slack_id)
        if (exists.rowCount === 0) {
          try {
            const addData = {
              slack_id,
              userName,
            }
            await createUser(addData)
          } catch (err) {
            throw new Error(
              'Something went wrong when trying to add user: ',
              err
            )
          }

          bot.postMessageToUser(
            userName,
            `Your ID: ${slack_id} was saved to the database as ${userName}!`
          )
        } else {
          bot.postMessageToUser(
            userName,
            `Your ID: ${slack_id} is already saved in the database!`
          )
        }
        break

      case 'WHOIS':
        // DISPLAY SOMEONES USER ID AND NAME <--- ONLY ADMIN, prompt for admin or password?

        if (!option[1]) {
          bot.postMessageToUser(userName, `Please specify a user ID`)
          break
        }
        const prompt = option[1].toUpperCase()

        if (user.is_admin) {
          promptedUser = await bot.getUserById(prompt)
          if (!promptedUser) {
            bot.postMessageToUser(
              userName,
              `Couldn't find any user with that ID`
            )
            break
          }
          const { real_name, email } = promptedUser.profile
          bot.postMessageToUser(
            userName,
            `ID: ${prompt}\n belongs to: ${real_name} | ${email} | user is: ${promptedUser.presence}`
          )
        } else {
          bot.postMessageToUser(
            userName,
            `You are not authorized for the request`
          )
        }
        break

      case 'NEWPROJECT':
        // POST REQUEST TO STORE A NEW PROJECT IN DATABASE
        let newProject = option[1].toUpperCase()
        let createProjectData = {
          newProject,
        }
        try {
          await createProject(createProjectData)
          message = `${userName} created a new project: ${option[1]}`
        } catch (err) {
          console.error(err)
          message = `Something went wrong: ${err}`
        }

        bot.postMessageToUser(userName, message)
        break

      case 'REPORT':
        // POST REQUEST TO STORE A DEVIATION WITH FOLLOWING INFORMATION
        let differentReasons = ['SICK', 'SJUK', 'VAB', 'EXTRA', 'OTHER']
        let reason = option[2].toUpperCase()

        let hours = parseInt(option[1])
        if (differentReasons.includes(reason)) {
          if (reason !== 'EXTRA') {
            hours = -hours
          }
        }
        let project = option[3].toUpperCase()
        let time = moment(option[4])
          .format('LL')
          .toUpperCase()

        let project_id = await getProjectByName(project)

        if ((hours, project, reason, time === undefined)) {
          message = 'One option was not reported correctly!'
        } else if (hours === NaN) {
          message =
            'You have not reported hours correctly! Only the number of hours!'
        } else if (time === 'INVALID DATE') {
          message = 'You have to use a correct time-format (YYYY-MM-DD)'
        } else if (project_id === undefined) {
          message = "Couldn't find any project with that name"
        } else {
          message = `You just reported ${hours}h of ${reason} for project ${project} at the date of: ${time}!`
        }

        // TODO DEN HÄR FUNKTIONEN KASTAR FATAL FEL OM PROJECT INTE FINNS
        let reportData = {
          hours,
          reason,
          project_id,
          slack_id,
          time,
        }

        if (reportData) {
          try {
            await reportDeviation(reportData)
          } catch (err) {
            bot.postMessageToUser(`Something went wrong fetching data: ${err}`)
            console.error(err)
          }
        }

        bot.postMessageToUser(userName, message)
        break

      case 'UPDATE':
        // PUT REQUEST TO UPDATE SPECIFIC ROW ON USER TABLE - but why? IS THIS USEFUL?!

        let whatUpdate = option[1]
        let value = option[2]
        bot.postMessageToUser(
          userName,
          `you updated your ${whatUpdate} to: ${value}!`
        )
        break

      case 'HELP':
      case 'COMMANDS':
      case 'LIST':
      case 'OPTIONS':
        // More options to display list template
        bot.postMessageToUser(
          userName,
          `• \`me\` Information about you\n• \`add\` Store your profile in the database!\n• \`whois\` Get user information on ID (eg. "whois FUS8XPWQ12L")\n• \`update\` Update your information *--COMING SOON--*\n• \`report\` Report deviation (eg. "report 8 Sick Vimla 2019-05-22")\n• \`check\` List your deviations for this month (eg. "check oct")\n• \`newproject\` Create a new project by name (eg. "newproject Vimla")\n`
        )
        break

      case 'CHECK':
        // GET REQUEST TO FETCH ALL DEVIATIONS FOR CURRENT USER FOR QUERIED MONTH
        let month
        if (!option[1]) {
          month = moment()
            .format('MMMM')
            .toUpperCase()
        } else {
          month = option[1].toUpperCase()
        }
        let checkoutData = {
          month,
        }
        const data = await getReports(checkoutData)
        let accTime = []
        if (data.length !== 0) {
          for (i = 0; i < data.length; i++) {
            accTime.push(data[i].hours)

            let week = moment(data[i].time).isoWeek()
            bot.postMessageToUser(
              userName,
              `v.*${week} <-> ${data[i].time}*\n*${data[i].userName}* | ${data[i].hours}h | ${data[i].reason} | ${data[i].name}!`
            )
          }
        } else if (data.length === 0) {
          bot.postMessageToUser(
            userName,
            `It seems you have nothing reported for that month!`
          )
        }
        // VARFÖR HAMNAR DEN HÄR HÖGST UPP IBLAND????
        if (accTime.length > 0) {
          totalReport = accTime.reduce((a, b) => a + b)
          bot.postMessageToUser(
            userName,
            `*************************\n\n *Total report for the month: ${totalReport} hours*`
          )
          console.log(accTime, totalReport)
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

// function listCommands(req, res, next) {
//   listTemplate(req, res)
// }

// function report(req, res, next) {
//   reportTemplate(req, res)
// }

setInterval(() => {
  getAllUsers().then(users => {
    users.map(user => {
      const time = Math.floor(new Date().getTime() / 1000)
      const created = Math.floor(user.created_at.getTime() / 1000)
      if (Math.abs(time - created) > 120) {
        if (user.has_been_greeted === false) {
          bot.getUserById(user.slack_id).then(slackUser => {
            if (slackUser) {
              userGreeted(user.slack_id)
              bot.postMessageToUser(
                slackUser.name,
                'Hej! Till mig kan du rapportera avvikelser för projekten du jobbar i!\n Skriv /list för att lista alla kommandon!'
              )
            }
          })
        }
      }
    })
  })
}, 3600000)

module.exports = {
  handleAction,
  // listCommands,
  // report,
}
