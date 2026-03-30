"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainService = void 0;
const JsonService_1 = require("./JsonService");
const SlackService_1 = require("./SlackService");
const NotificationService_1 = require("./NotificationService");
const core = __importStar(require("@actions/core"));
class MainService {
    async run() {
        core.info('Starting CyDig notification action');
        const cydigConfigPath = core.getInput('cydigConfigPath', {
            required: true,
        });
        const slackAccessToken = core.getInput('slackAccessToken', {
            required: true,
        });
        const cydigConfig = (0, JsonService_1.getContentOfFile)(cydigConfigPath);
        if (!cydigConfig.teamName) {
            throw new Error('Missing team name in config');
        }
        if (!cydigConfig.communicationTool.slack.channelName) {
            throw new Error('Missing slack channel name in config');
        }
        let dashboardUrl;
        if (!process.env?.dashboardUrl) {
            dashboardUrl = 'https://cydig.omegapoint.cloud/dashboard';
        }
        else {
            dashboardUrl = process.env.dashboardUrl;
        }
        const notificationService = new NotificationService_1.NotificationService();
        const slackService = new SlackService_1.SlackService(slackAccessToken);
        const complianceHistory = await notificationService.fetchRelevantComplianceHistory(cydigConfig.teamName);
        core.info(`Fetched compliance history for team ${cydigConfig.teamName}: ${complianceHistory}`);
        const shouldSendAlert = complianceHistory.shouldSendAlert();
        core.info(`Should send slack alert: ${shouldSendAlert}`);
        if (shouldSendAlert) {
            await slackService.sendToSlack(complianceHistory, cydigConfig.communicationTool.slack.channelName, dashboardUrl);
        }
    }
}
exports.MainService = MainService;
//# sourceMappingURL=MainService.js.map