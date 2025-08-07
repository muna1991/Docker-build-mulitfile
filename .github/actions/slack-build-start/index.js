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
        text: `🚀 Docker build started for ${repo}:${tag} in ${environment} ${region}`,
        blocks: [
            {
                type: 'header',
                text: { type: 'plain_text', text: '🚀 Docker Build Started', emoji: true }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Repository:* ${repo}\n*Tag:* ${tag}\n*Environment:* ${environment}\n*Region:* ${region}`
                }
            },
            {
                type: 'context',
                elements: [
                    { type: 'mrkdwn', text: '🔧 Build in progress...' }
                ]
            }
        ]
    });
})();

