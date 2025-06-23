import axios from 'axios';
import ComplianceHistoryDTO from './model/ComplianceHistoryDTO';
import { ComplianceHistory } from './model/ComplianceHistory';
import * as core from '@actions/core';

export class NotificationService {
    public async fetchRelevantComplianceHistory(teamName: string): Promise<ComplianceHistory> {
        let urlNotification: string;
        if (!process.env?.urlNotification) {
            urlNotification = "https://func-cydig-notification-service-prod.azurewebsites.net";
        }
        urlNotification = process.env.urlNotification as string;

        if (!process.env?.updateKey) {
            throw new Error('Could not find environment variable updateKey');
        }
        const notificationFunctionKey: string = process.env.updateKey;

        const urlComplianceHistory: string = `${urlNotification}/api/teams/${teamName}/history?code=${notificationFunctionKey}`;
        return fetchData(urlComplianceHistory)
            .then((body) => {
                return new ComplianceHistory(body.teamName, body.currentCompliance, body.previousCompliance);
            })
            .catch((error: any) => {
                throw new Error(`Request failed with status code: ${error.response.status}. ${error.response.data}`);
            });
    }
}

async function fetchData(url: string): Promise<ComplianceHistoryDTO> {
    try {
        const response = await axios.get<ComplianceHistoryDTO>(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
