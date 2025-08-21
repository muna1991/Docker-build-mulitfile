const core = require('@actions/core');
const { WebClient } = require('@slack/web-api');

(async () => {
    try {
        const token = core.getInput('slack_token');
        const slack = new WebClient(token);
        const channel = core.getInput('channel_id');
        const repo = core.getInput('repository');
        const tag = core.getInput('image_tag');
        const environment = core.getInput('environment');
        const region = core.getInput('region');
        const reportUrl = core.getInput('s3_report_url');

        // 🔍 Scan Started
        await slack.chat.postMessage({
            channel,
            text: `🔍 Scan started for ${repo}:${tag} in ${environment} ${region}`,
            blocks: [
                {
                    type: 'header',
                    text: { type: 'plain_text', text: '🔍 Scan Started', emoji: true }
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
                        { type: 'mrkdwn', text: '🛡️ Security scan in progress...' }
                    ]
                }
            ]
        });

        // ✅ Scan Completed
        await slack.chat.postMessage({
            channel,
            text: `✅ Scan completed for ${repo}:${tag} in ${environment} ${region}`,
            blocks: [
                {
                    type: 'header',
                    text: { type: 'plain_text', text: '✅ Scan Completed', emoji: true }
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Repository:* ${repo}\n*Tag:* ${tag}\n*Environment:* ${environment}\n*Region:* ${region}`
                    }
                },
                {
                    type: 'actions',
                    elements: [
                        {
                            type: 'button',
                            text: { type: 'plain_text', text: '📄 View Scan Report', emoji: true },
                            url: reportUrl,
                            style: 'primary'
                        }
                    ]
                },
                {
                    type: 'context',
                    elements: [
                        { type: 'mrkdwn', text: '📊 Review the scan report for details.' }
                    ]
                }
            ]
        });
    } catch (err) {
        core.setFailed(`Slack notification failed: ${err.message}`);
    }
})();
