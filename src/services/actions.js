const { reportDeviation, getReports } = require('./queries')
const moment = require('moment')
const dotenv = require('dotenv');
dotenv.config();

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

  option = text.split(' ')

  if (text) {
    switch (option[0]) {
      case '--me':
        bot.postMessageToUser(
          userName,
          `ID: ${slack_id} Name: ${userName}`
          // GET REQUEST TO USER INFORMATION ON ID?
        )
        break
      case '--report':
        let hours = option[1]
        let reason = option[2]
        let project = option[3]
        let time = option[4]

        let reportData = {
          hours,
          reason,
          project,
          slack_id,
          time
        }

        if ((hours, reason, project, time === undefined)) {
          message = 'You did not report correctly'
        } else {
          formattedTime = time.format('LL');
          
          message = `You just reported ${hours} of ${reason} for project ${project} at the date of: ${formattedTime}!`
        }
        try {
          await reportDeviation(reportData)
        } catch (err) {
          console.error(err)
        }

        bot.postMessageToUser(
          userName,
          message
          // POST REQUEST TO STORE REASON, HOURS, PROJECTS, time IN DB
        )
        break
      case '--update':
        let whatUpdate = option[1]
        let value = option[2]
        bot.postMessageToUser(
          userName,
          `you updated your ${whatUpdate} to: ${value}!`
          // PUT REQUEST TO UPDATE SPECIFIC ROW ON USER TABLE - but why?
        )
        break
      case '--checkout':
        let month = option[1]
        let checkoutData = {
          month,
          slack_id,
        }

        const data = await getReports(checkoutData)

        for (i = 0; i < data.length; i++) {
          // TODO::: created_at is an integer and needs to be a cuttable string
        
          bot.postMessageToUser(
            userName,
            `${hej[i]}\n
              ${data[i].hours}h, Reason: ${data[i].reason}, Project: ${data[i].project}!`
            // GET REQUEST * FOR DEVIATIONS TABLE ON USER.ID
          )
        }
        break
      default:
        bot.postMessageToUser(userName, 'Please use a valid command!')
    }
  }
}

function handleAction(req, res, next) {
  res.send({
    challenge: req.body.challenge,
  })
}

function listCommands(req, res, next) {
  res.send({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text:
            'Hey ' +
            req.body.user_name +
            ' :smile:! You can use following commands:',
          emoji: true,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text:
              '• `--me` Information about you\n• `--update` Update your information\n• `--report` Report deviation (YYYY-MM-DD) eg. "2019-05-22"\n• `--checkout` List your deviations for this month\n',
          },
        ],
      },
    ],
  })
}

function displayPayloads(req, res, next) {
  console.log(req, res)
}

function report(req, res, next) {
  res.send({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Report deviation:',
        },
        accessory: {
          type: 'static_select',
          action_id: 'kalle',
          placeholder: {
            type: 'plain_text',
            text: 'Anledning',
            emoji: true,
          },
          options: [
            {
              text: {
                type: 'plain_text',
                text: 'Sick',
                emoji: true,
              },
              value: 'value-0',
            },
          ],
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ' ',
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Submit',
            emoji: true,
          },
          value: 'click_me_123',
        },
      },
    ],
  })
}

module.exports = {
  handleAction,
  listCommands,
  report,
  displayPayloads,
}
