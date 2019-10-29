const listTemplate = (req, res) => {
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
              '• `--me` Information about you\n• `--update` Update your information\n• `--report` Report deviation -> Hours, Reason, Project & Time(YYYY-MM-DD) eg. "--report 8 Sick Vimla 2019-05-22"\n• `--checkout` List your deviations for this month eg. "--checkout October"\n• `--newProject` Create a new project by name, eg. "--newProject Vimla"',
          },
        ],
      },
    ],
  })
}

module.exports = {
  listTemplate,
}
