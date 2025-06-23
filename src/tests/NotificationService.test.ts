import { expect } from 'chai';
import sinon from 'sinon';
import axios from 'axios';
import { NotificationService } from '../lib/NotificationService';
import ComplianceHistoryDTO from '../lib/model/ComplianceHistoryDTO';
import { ComplianceHistory } from '../lib/model/ComplianceHistory';

describe('NotifcationService', () => {
    let axiosGetStub: sinon.SinonStub;

    const complianceHistoryDTO: ComplianceHistoryDTO = {
        teamName: 'Cydig',
        currentCompliance: { date: '2025-05-07', score: 70, maxScore: 100 },
        previousCompliance: { date: '2025-05-08', score: 90, maxScore: 100 },
    };

    const expected: ComplianceHistory = new ComplianceHistory(
        'Cydig',
        { date: '2025-05-07', score: 70, maxScore: 100 },
        { date: '2025-05-08', score: 90, maxScore: 100 },
    );

    beforeEach(() => {
        axiosGetStub = sinon.stub(axios, 'get');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should fetch compliance history successfully', async () => {
        axiosGetStub.resolves({ data: complianceHistoryDTO });

        const service = new NotificationService();
        const result = await service.fetchRelevantComplianceHistory('Cydig');

        expect(axiosGetStub.calledOnce).to.be.true;
        expect(axiosGetStub.firstCall.args[0].startsWith(
            `${process.env.urlNotification}/api/teams/Cydig/history?code=`
        )).to.be.true;
        expect(result).to.deep.equal(expected);
    });

    it('should throw an error when http request fails', async () => {
        const fakeError = {
            response: {
                status: 404,
                data: 'Not Found',
            },
        };
        axiosGetStub.rejects(fakeError);

        const service = new NotificationService();

        try {
            await service.fetchRelevantComplianceHistory('Cydig');
            expect.fail('Expected method to throw.');
        } catch (err: any) {
            expect(err.message).to.include('Request failed with status code: 404');
            expect(err.message).to.include('Not Found');
        }
    });
});
