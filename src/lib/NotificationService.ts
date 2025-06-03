import axios from 'axios';
import config from '../config.json';
import ComplianceHistoryDTO from './model/ComplianceHistoryDTO';
import { ComplianceHistory } from './model/ComplianceHistory';

export class NotificationService {
    public async fetchRelevantComplianceHistory(teamName: string): Promise<ComplianceHistory> {
        const urlComplianceHistory: string = `${config.urlNotification}/api/teams/${teamName}/history?code=${config.notificationFunctionKey}`;
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
