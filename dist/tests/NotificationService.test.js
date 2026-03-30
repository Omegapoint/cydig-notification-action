"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = __importDefault(require("sinon"));
const axios_1 = __importDefault(require("axios"));
const mock_require_1 = __importDefault(require("mock-require"));
const core = {
    warning: () => undefined,
    notice: () => undefined,
    info: () => undefined,
    exportVariable: () => undefined,
};
(0, mock_require_1.default)('@actions/core', core);
const { NotificationService } = require('../src/lib/NotificationService');
const ComplianceHistoryDTO = require('../src/lib/model/ComplianceHistoryDTO');
const { ComplianceHistory } = require('../src/lib/model/ComplianceHistory');
describe('NotifcationService', () => {
    let axiosGetStub;
    const complianceHistoryDTO = {
        teamName: 'Cydig',
        currentCompliance: { date: '2025-05-07', score: 70, maxScore: 100 },
        previousCompliance: { date: '2025-05-08', score: 90, maxScore: 100 },
    };
    const expected = new ComplianceHistory('Cydig', { date: '2025-05-07', score: 70, maxScore: 100 }, { date: '2025-05-08', score: 90, maxScore: 100 });
    beforeEach(() => {
        process.env.updateKey = 'dummyUpdateKey';
        process.env.urlNotification = 'https://notification.example.test';
        axiosGetStub = sinon_1.default.stub(axios_1.default, 'get');
    });
    afterEach(() => {
        sinon_1.default.restore();
    });
    it('should fetch compliance history successfully', async () => {
        axiosGetStub.resolves({ data: complianceHistoryDTO });
        const service = new NotificationService();
        const result = await service.fetchRelevantComplianceHistory('Cydig');
        (0, chai_1.expect)(axiosGetStub.calledOnce).to.be.true;
        (0, chai_1.expect)(axiosGetStub.firstCall.args[0].startsWith(`${process.env.urlNotification}/api/teams/Cydig/history?code=`)).to.be.true;
        (0, chai_1.expect)(result).to.deep.equal(expected);
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
            chai_1.expect.fail('Expected method to throw.');
        }
        catch (err) {
            (0, chai_1.expect)(err.message).to.include('Request failed with status code: 404');
            (0, chai_1.expect)(err.message).to.include('Not Found');
        }
    });
});
//# sourceMappingURL=NotificationService.test.js.map