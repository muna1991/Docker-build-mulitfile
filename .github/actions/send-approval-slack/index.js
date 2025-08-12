const core = require('@actions/core');
const { WebClient } = require('@slack/web-api');

async function run() {
    try {
        const token = core.getInput('slack_token');
        const channel = core.getInput('channel_id');
        const repository = core.getInput('repository');
        const environment = core.getInput('environment');
        const region = core.getInput('region');
        const imageTag = core.getInput('image_tag');

        const slack = new WebClient(token);

        // Button values encode all data: decision:repository:environment:region:image_tag
        const approveValue = `approve:${repository}:${environment}:${region}:${imageTag}`;
        const rejectValue = `reject:${repository}:${environment}:${region}:${imageTag}`;

        await slack.chat.postMessage({
            channel: channel,
            text: `Docker image *${imageTag}* is ready for push.`,
            attachments: [
                {
                    text: 'Approve or Reject this deployment',
                    fallback: 'Unable to approve/reject',
                    callback_id: 'approval_action',
                    actions: [
                        {
                            name: 'approve',
                            text: 'Approve ✅',
                            type: 'button',
                            value: approveValue,
                            style: 'primary'
                        },
                        {
                            name: 'reject',
                            text: 'Reject ❌',
                            type: 'button',
                            value: rejectValue,
                            style: 'danger'
                        }
                    ]
                }
            ]
        });

        console.log('Slack approval message sent successfully');
    } catch (error) {
        core.setFailed(`Error sending Slack message: ${error.message}`);
    }
}

run();