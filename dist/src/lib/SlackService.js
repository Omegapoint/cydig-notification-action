"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackService = void 0;
const axios_1 = __importDefault(require("axios"));
class SlackService {
    slackAccessToken;
    constructor(slackAccessToken) {
        this.slackAccessToken = slackAccessToken;
    }
    async sendToSlack(complianceHistory, channel, dashboardUrl) {
        const requestBody = createSlackMessage(channel, complianceHistory, dashboardUrl);
        const response = await sendMessage(requestBody, this.slackAccessToken);
        if (!response.ok) {
            throw new Error('Error when posting slack message. With error message from slack : ' + response.error);
        }
    }
}
exports.SlackService = SlackService;
function createSlackMessage(channel, complianceHistory, dashboardUrl) {
    const { teamName, currentCompliance, previousCompliance } = complianceHistory;
    return {
        channel: channel,
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*:bar_chart: Compliance Score Update for ${teamName}*`,
                },
            },
            {
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: `*${currentCompliance.date}:* ${complianceHistory.currentPercentage().toFixed(2)}% (${currentCompliance.score}/${currentCompliance.maxScore})
*${previousCompliance.date}:* ${complianceHistory.previousPercentage().toFixed(2)}% (${previousCompliance.score}/${previousCompliance.maxScore})`,
                    },
                ],
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `:warning: *Score dropped by* *${complianceHistory.percentageDrop().toFixed(2)} %* :arrow_down_small:\n\nPlease investigate the cause of the decrease:\n\n${dashboardUrl}?team=${encodeURIComponent(teamName)}`,
                },
            },
        ],
    };
}
async function sendMessage(request, accessToken) {
    const slackUrl = 'https://slack.com/api/chat.postMessage';
    try {
        const result = await axios_1.default.post(slackUrl, request, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + accessToken,
            },
        });
        return result.data;
    }
    catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
//# sourceMappingURL=SlackService.js.map