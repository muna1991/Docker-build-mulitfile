import core from "@actions/core";
import { WebClient } from "@slack/web-api";

const run = async () => {
    try {
        const slack_token = core.getInput("slack_token");
        const channel_id = core.getInput("channel_id");
        const repository = core.getInput("repository");
        const image_tag = core.getInput("image_tag");
        const s3_report_url = core.getInput("s3_report_url");

        const slack = new WebClient(slack_token);

        // Notify scan started
        await slack.chat.postMessage({
            channel: channel_id,
            text: `🔍 *Scan started* for \`${repository}:${image_tag}\``
        });

        // Notify scan completed with report button
        await slack.chat.postMessage({
            channel: channel_id,
            text: `✅ *Scan completed* for \`${repository}:${image_tag}\``,
            attachments: [
                {
                    text: "View full scan report",
                    fallback: "View scan report",
                    actions: [
                        {
                            type: "button",
                            text: "📄 View Scan Report",
                            url: s3_report_url,
                            style: "primary"
                        }
                    ]
                }
            ]
        });
    } catch (err) {
        core.setFailed(`Slack notification failed: ${err.message}`);
    }
};

run();
