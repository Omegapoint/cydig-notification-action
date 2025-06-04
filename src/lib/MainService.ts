import { CyDigConfig } from './model/CyDigConfig';
import { getContentOfFile } from './JsonService';
import { SlackService } from './SlackService';
import { NotificationService } from './NotificationService';
import config from '../config.json';
import { ComplianceHistory } from './model/ComplianceHistory';
import * as core from '@actions/core';

export class MainService {
    public async run(): Promise<void> {
        const cydigConfigPath: string = core.getInput('cydigConfigPath', {
            required: true,
        });
        const slackAccessToken: string = core.getInput('slackAccessToken', {
            required: true,
        });
        let dashboardUrl: string = config.dashboardUrl;

        const cydigConfig: CyDigConfig = getContentOfFile(cydigConfigPath);

        if (!cydigConfig.teamName) {
            throw new Error('Missing team name in config');
        }
        if (!cydigConfig.communicationTool.slack.channelName) {
            throw new Error('Missing slack channel name in config');
        }
        if (!dashboardUrl) {
            dashboardUrl = "https://cydig.omegapoint.cloud/dashboard";
            core.info('No dashboard URL provided, using prod: ' + dashboardUrl);
        }

        const notificationService: NotificationService = new NotificationService();
        const slackService: SlackService = new SlackService(slackAccessToken);

        const complianceHistory: ComplianceHistory = await notificationService.fetchRelevantComplianceHistory(
            cydigConfig.teamName,
        );
        core.info(`Fetched compliance history for team ${cydigConfig.teamName}: ${complianceHistory}`);
        const shouldSendAlert: boolean = complianceHistory.shouldSendAlert();
        core.info(`Should send slack alert: ${shouldSendAlert}`);

        if (shouldSendAlert) {        
            await slackService.sendToSlack(
                complianceHistory,
                cydigConfig.communicationTool.slack.channelName,
                dashboardUrl,
            );
        }
    }
}
