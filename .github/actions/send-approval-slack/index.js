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

        // Button value encoding: decision:repository:environment:region:image_tag
        const approveValue = `approve:${repository}:${environment}:${region}:${imageTag}`;
        const rejectValue = `reject:${repository}:${environment}:${region}:${imageTag}`;

        await slack.chat.postMessage({
            channel,
            text: `Docker image *${imageTag}* is ready for push approval.`,
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: '🚦 Deployment Approval Required',
                        emoji: true
                    }
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Repository:* ${repository}\n*Tag:* ${imageTag}\n*Environment:* ${environment}\n*Region:* ${region}`
                    }
                },
                {
                    type: 'actions',
                    elements: [
                        {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'Approve ✅',
                                emoji: true
                            },
                            style: 'primary',
                            value: approveValue,
                            action_id: 'approve_action'
                        },
                        {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'Reject ❌',
                                emoji: true
                            },
                            style: 'danger',
                            value: rejectValue,
                            action_id: 'reject_action'
                        }
                    ]
                },
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: 'Please approve or reject to proceed with the deployment.'
                        }
                    ]
                }
            ]
        });

        console.log('Slack approval message sent successfully');
    } catch (error) {
        core.setFailed(`Error sending Slack approval message: ${error.message}`);
    }
}

run();
