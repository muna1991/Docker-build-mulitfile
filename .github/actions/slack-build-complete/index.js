const core = require('@actions/core');
const { WebClient } = require('@slack/web-api');

(async () => {
    const token = core.getInput('slack_token');
    const slack = new WebClient(token);
    const channel = core.getInput('channel_id');
    const tag = core.getInput('image_tag');
    const repo = core.getInput('repository');

    await slack.chat.postMessage({
        channel,
        text: `✅ Docker build completed for ${repo}:${tag}`,
        blocks: [
            { type: 'header', text: { type: 'plain_text', text: '✅ Docker Build Successful', emoji: true } },
            {
                type: 'section', fields: [
                    { type: 'mrkdwn', text: `*📦 Repository:*\n\`${repo}\`` },
                    { type: 'mrkdwn', text: `*🏷️ Tag:*\n\`${tag}\`` }
                ]
            },
            { type: 'context', elements: [{ type: 'mrkdwn', text: '✅ Image is now available.' }] }
        ]
    });
})();