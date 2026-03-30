"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const axios_1 = __importDefault(require("axios"));
const ComplianceHistory_1 = require("./model/ComplianceHistory");
class NotificationService {
    async fetchRelevantComplianceHistory(teamName) {
        let urlNotification;
        if (!process.env?.urlNotification) {
            urlNotification = 'https://func-cydig-notification-service-prod.azurewebsites.net';
        }
        else {
            urlNotification = process.env.urlNotification;
        }
        if (!process.env?.updateKey) {
            throw new Error('Could not find environment variable updateKey');
        }
        const notificationFunctionKey = process.env.updateKey;
        const urlComplianceHistory = `${urlNotification}/api/teams/${teamName}/history?code=${notificationFunctionKey}`;
        return fetchData(urlComplianceHistory)
            .then((body) => {
            return new ComplianceHistory_1.ComplianceHistory(body.teamName, body.currentCompliance, body.previousCompliance);
        })
            .catch((error) => {
            throw new Error(`Request failed with status code: ${error.response.status}. ${error.response.data}`);
        });
    }
}
exports.NotificationService = NotificationService;
async function fetchData(url) {
    try {
        const response = await axios_1.default.get(url);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
//# sourceMappingURL=NotificationService.js.map