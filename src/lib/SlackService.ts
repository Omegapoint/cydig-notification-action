import axios from 'axios';
import { SlackPostMessagePayload } from './model/SlackRequestBody';
import { SlackResponse } from './model/SlackResponse';
import { ComplianceHistory } from './model/ComplianceHistory';

export class SlackService {
    slackAccessToken: string;

    constructor(slackAccessToken: string) {
        this.slackAccessToken = slackAccessToken;
    }

    public async sendToSlack(
        complianceHistory: ComplianceHistory,
        channel: string,
        dashboardUrl: string,
    ): Promise<void> {
        const requestBody: SlackPostMessagePayload = createSlackMessage(channel, complianceHistory, dashboardUrl);

        const response: SlackResponse = await sendMessage(requestBody, this.slackAccessToken);

        if (!response.ok) {
            throw new Error('Error when posting slack message. With error message from slack : ' + response.error);
        }
    }
}

function createSlackMessage(
    channel: string,
    complianceHistory: ComplianceHistory,
    dashboardUrl: string,
): SlackPostMessagePayload {
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

async function sendMessage(request: SlackPostMessagePayload, accessToken: string): Promise<SlackResponse> {
    const slackUrl: string = 'https://slack.com/api/chat.postMessage';

    try {
        const result = await axios.post(slackUrl, request, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + accessToken,
            },
        });
        return result.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
