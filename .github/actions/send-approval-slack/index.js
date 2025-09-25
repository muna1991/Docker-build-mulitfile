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
        const approvalUrl = core.getInput('approval_url'); // GitHub approval link

        const slack = new WebClient(token);

        await slack.chat.postMessage({
            channel: channel,
            text: `Docker image *${repository}*:*${imageTag}* is ready for push to *${environment}*.\nPlease approve here: ${approvalUrl}`,
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
                            url: approvalUrl,
                            style: 'primary'
                        },
                        {
                            name: 'reject',
                            text: 'Reject ❌',
                            type: 'button',
                            value: `reject:${repository}:${environment}:${region}:${imageTag}`,
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
