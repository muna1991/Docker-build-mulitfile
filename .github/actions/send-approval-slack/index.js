const core = require('@actions/core');
const { WebClient } = require('@slack/web-api');

(async () => {
    const token = core.getInput('slack_token');
    const slack = new WebClient(token);
    const channel = core.getInput('channel_id');
    const tag = core.getInput('image_tag');
    const repo = core.getInput('repository');
    const environment = core.getInput('environment');
    const region = core.getInput('region');

    await slack.chat.postMessage({
        channel,
        text: `✅ Docker image ${repo}:${tag} is ready for push in ${environment} (${region}).`,
        blocks: [
            {
                type: 'header',
                text: { type: 'plain_text', text: '✅ Image Ready for Push', emoji: true }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Repository:* ${repo}\n*Tag:* ${tag}\n*Environment:* ${environment}\n*Region:* ${region}`
                }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Docker image *${repo}* and *${tag}* is ready for push.\nApprove or Reject this deployment.`
                }
            },
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: { type: 'plain_text', text: 'Approve ✅', emoji: true },
                        style: 'primary',
                        value: 'approve'
                    },
                    {
                        type: 'button',
                        text: { type: 'plain_text', text: 'Reject ❌', emoji: true },
                        style: 'danger',
                        value: 'reject'
                    }
                ]
            }
        ]
    });
})();

