const reportTemplate = (req, res) => {
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
  reportTemplate
}