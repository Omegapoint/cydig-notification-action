"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sinon_1 = __importDefault(require("sinon"));
const mock_require_1 = __importDefault(require("mock-require"));
const chai_1 = __importDefault(require("chai"));
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const path_1 = __importDefault(require("path"));
chai_1.default.use(chai_as_promised_1.default);
const expect = chai_1.default.expect;
const core = {
    warning: () => undefined,
    notice: () => undefined,
    info: () => undefined,
    exportVariable: () => undefined,
    getInput: () => undefined,
};
(0, mock_require_1.default)('@actions/core', core);
const { ComplianceHistory } = require('../src/lib/model/ComplianceHistory');
const { MainService } = require('../src/lib/MainService');
const { SlackService } = require('../src/lib/SlackService');
const { NotificationService } = require('../src/lib/NotificationService');
describe('MainService', () => {
    let getInputMock;
    let fetchComplianceHistoryMock;
    let sendSlackMessageMock;
    beforeEach(() => {
        getInputMock = sinon_1.default.stub(core, 'getInput');
        fetchComplianceHistoryMock = sinon_1.default.stub(NotificationService.prototype, 'fetchRelevantComplianceHistory');
        sendSlackMessageMock = sinon_1.default.stub(SlackService.prototype, 'sendToSlack');
    });
    afterEach(() => {
        sinon_1.default.restore();
    });
    it('should call fetch compliance history and send to slack', async () => {
        const historyCompliance = new ComplianceHistory('CyDig', { date: '2025-05-07', score: 70, maxScore: 100 }, { date: '2025-05-07', score: 90, maxScore: 100 });
        getInputMock
            .withArgs('cydigConfigPath', sinon_1.default.match.any)
            .returns(path_1.default.join(__dirname, '../../tests/CyDigConfigValid.json'));
        getInputMock.withArgs('slackAccessToken', sinon_1.default.match.any).returns('dummyToken');
        fetchComplianceHistoryMock.resolves(historyCompliance);
        sendSlackMessageMock.resolves();
        await new MainService().run();
        expect(fetchComplianceHistoryMock.calledOnceWith('CyDig')).to.be.true;
        expect(sendSlackMessageMock.calledOnceWith(historyCompliance, sinon_1.default.match.any, sinon_1.default.match.any)).to.be.true;
    });
    it('should not send slack message when scores are equal', async () => {
        const historyCompliance = new ComplianceHistory('CyDig', { date: '2025-05-07', score: 90, maxScore: 100 }, { date: '2025-05-07', score: 90, maxScore: 100 });
        getInputMock
            .withArgs('cydigConfigPath', sinon_1.default.match.any)
            .returns(path_1.default.join(__dirname, '../../tests/CyDigConfigValid.json'));
        getInputMock.withArgs('slackAccessToken', sinon_1.default.match.any).returns('dummyToken');
        fetchComplianceHistoryMock.resolves(historyCompliance);
        sendSlackMessageMock.resolves();
        await new MainService().run();
        expect(fetchComplianceHistoryMock.calledOnceWith('CyDig')).to.be.true;
        expect(sendSlackMessageMock.notCalled).to.be.true;
    });
    it('should return false when team name is missing', async () => {
        getInputMock
            .withArgs('cydigConfigPath', sinon_1.default.match.any)
            .returns(path_1.default.join(__dirname, '../../tests/CyDigConfigTeamNameMissing.json'));
        getInputMock.withArgs('slackAccessToken', sinon_1.default.match.any).returns('dummyToken');
        await expect(new MainService().run()).to.be.rejectedWith('Missing team name in config');
        expect(fetchComplianceHistoryMock.notCalled).to.be.true;
        expect(sendSlackMessageMock.notCalled).to.be.true;
    });
    it('should return false when channel name is missing', async () => {
        getInputMock
            .withArgs('cydigConfigPath', sinon_1.default.match.any)
            .returns(path_1.default.join(__dirname, '../../tests/CyDigConfigChannelNameMissing.json'));
        getInputMock.withArgs('slackAccessToken', sinon_1.default.match.any).returns('dummyToken');
        await expect(new MainService().run()).to.be.rejectedWith('Missing slack channel name in config');
        expect(fetchComplianceHistoryMock.notCalled).to.be.true;
        expect(sendSlackMessageMock.notCalled).to.be.true;
    });
    it('should handle malformed config file', async () => {
        getInputMock
            .withArgs('cydigConfigPath', sinon_1.default.match.any)
            .returns(path_1.default.join(__dirname, '../../tests/CyDigConfigMalformed.json'));
        getInputMock.withArgs('slackAccessToken', sinon_1.default.match.any).returns('dummyToken');
        await expect(new MainService().run()).to.be.rejectedWith('Got the following error when trying to read config file:SyntaxError');
        expect(fetchComplianceHistoryMock.notCalled).to.be.true;
        expect(sendSlackMessageMock.notCalled).to.be.true;
    });
});
//# sourceMappingURL=MainService.test.js.map