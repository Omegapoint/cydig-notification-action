import axios from 'axios';
import config from '../config.json';
import ComplianceHistoryDTO from './model/ComplianceHistoryDTO';
import { ComplianceHistory } from './model/ComplianceHistory';
import * as core from '@actions/core';

export class NotificationService {
    public async fetchRelevantComplianceHistory(teamName: string): Promise<ComplianceHistory> {
        let urlNotification: string = config.urlNotification;
        let notificationFunctionKey: string = config.notificationFunctionKey;
        
        if (!notificationFunctionKey) {
            if (!process.env.updateKey) {
                throw new Error('Notification function key is not configured in environment variable "updateKey".');
            }
            notificationFunctionKey = process.env.updateKey; 
            core.info('Using function key from environment variable "updateKey".');
        }

        if (!urlNotification) {
            urlNotification = "https://func-cydig-notification-service-prod.azurewebsites.net"
            core.info('Using prod notification URL ' + urlNotification);
        }   

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
