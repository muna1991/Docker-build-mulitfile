const core = require('@actions/core');
const { WebClient } = require('@slack/web-api');

const token = core.getInput('slack_token');
const channel = core.getInput('channel_id');
const imageTag = core.getInput('image_tag');
const repo = core.getInput('repository');

const slack = new WebClient(token);

(async () => {
    await slack.chat.postMessage({
        channel: channel,
        text: `Docker image *${repo}* and *${imageTag}* is ready for production push.`,
        attachments: [
            {
                text: 'Approve or Reject this deployment',
                fallback: 'Unable to approve',
                callback_id: 'approval_action',
                actions: [
                    {
                        name: 'approve',
                        text: 'Approve ✅',
                        type: 'button',
                        value: 'approve',
                        style: 'primary'
                    },
                    {
                        name: 'reject',
                        text: 'Reject ❌',
                        type: 'button',
                        value: 'reject',
                        style: 'danger'
                    }
                ]
            }
        ]
    });
})();