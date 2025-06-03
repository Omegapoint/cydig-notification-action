import sinon from 'sinon';
import axios from 'axios';
import { SlackService } from '../lib/SlackService';
import { ComplianceHistory } from '../lib/model/ComplianceHistory';

describe('SlackService', () => {
    let axiosMock: sinon.SinonStub;

    beforeEach(() => {
        axiosMock = sinon.stub(axios, 'post');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should post message to slack', async () => {
        const complianceHistory: ComplianceHistory = new ComplianceHistory(
            'CyDig',
            { date: '2025-05-08', score: 70, maxScore: 100 },
            { date: '2025-05-07', score: 90, maxScore: 100 },
        );

        const channelName = 'testChannel';
        const accessToken = 'TestAccessToken';
        const dashboardUrl = 'testurl';
        const slackService: SlackService = new SlackService(accessToken);

        const requestBody = {
            channel: channelName,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '*:bar_chart: Compliance Score Update for CyDig*',
                    },
                },
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: '*2025-05-08:* 70.00% (70/100)\n*2025-05-07:* 90.00% (90/100)',
                        },
                    ],
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: ':warning: *Score dropped by* *20.00 %* :arrow_down_small:\n\n:red_circle: Please investigate the cause of the decrease:\n\ntesturl?team=CyDig',
                    },
                },
            ],
        };

        const slackUrl = 'https://slack.com/api/chat.postMessage';
        const headers = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + accessToken,
            },
        };

        axiosMock.withArgs(slackUrl, requestBody, headers).returns({
            data: {
                ok: true,
            },
        });

        await slackService.sendToSlack(complianceHistory, channelName, dashboardUrl);
    });
});
