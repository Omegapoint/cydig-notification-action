import sinon from 'sinon';
import * as core from '@actions/core';
import { MainService } from '../lib/MainService';
import { SlackService } from '../lib/SlackService';
import { NotificationService } from '../lib/NotificationService';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ComplianceHistory } from '../lib/model/ComplianceHistory';
import path from 'path';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('MainService', () => {
    let getInputMock: sinon.SinonStub;
    let fetchComplianceHistoryMock: sinon.SinonStub;
    let sendSlackMessageMock: sinon.SinonStub;

    beforeEach(() => {
        getInputMock = sinon.stub(core, 'getInput');
        fetchComplianceHistoryMock = sinon.stub(NotificationService.prototype, 'fetchRelevantComplianceHistory');
        sendSlackMessageMock = sinon.stub(SlackService.prototype, 'sendToSlack');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should call fetch compliance history and send to slack', async () => {
        const historyCompliance: ComplianceHistory = new ComplianceHistory(
            'CyDig',
            { date: '2025-05-07', score: 70, maxScore: 100 },
            { date: '2025-05-07', score: 90, maxScore: 100 },
        );

        getInputMock
            .withArgs('cydigConfigPath', sinon.match.any)
            .returns(path.join(__dirname, 'CyDigConfigValid.json'));
        getInputMock.withArgs('slackAccessToken', sinon.match.any).returns('dummyToken');
        fetchComplianceHistoryMock.resolves(historyCompliance);
        sendSlackMessageMock.resolves();

        await new MainService().run();

        expect(fetchComplianceHistoryMock.calledOnceWith('CyDig')).to.be.true;
        expect(sendSlackMessageMock.calledOnceWith(historyCompliance, sinon.match.any, sinon.match.any)).to.be.true;
    });

    it('should not send slack message when scores are equal', async () => {
        const historyCompliance: ComplianceHistory = new ComplianceHistory(
            'CyDig',
            { date: '2025-05-07', score: 90, maxScore: 100 },
            { date: '2025-05-07', score: 90, maxScore: 100 },
        );

        getInputMock
            .withArgs('cydigConfigPath', sinon.match.any)
            .returns(path.join(__dirname, 'CyDigConfigValid.json'));

        getInputMock.withArgs('slackAccessToken', sinon.match.any).returns('dummyToken');
        fetchComplianceHistoryMock.resolves(historyCompliance);
        sendSlackMessageMock.resolves();

        await new MainService().run();

        expect(fetchComplianceHistoryMock.calledOnceWith('CyDig')).to.be.true;
        expect(sendSlackMessageMock.notCalled).to.be.true;
    });

    it('should return false when team name is missing', async () => {
        getInputMock
            .withArgs('cydigConfigPath', sinon.match.any)
            .returns(path.join(__dirname, 'CyDigConfigTeamNameMissing.json'));

        getInputMock.withArgs('slackAccessToken', sinon.match.any).returns('dummyToken');

        await expect(new MainService().run()).to.be.rejectedWith('Missing team name in config');

        expect(fetchComplianceHistoryMock.notCalled).to.be.true;
        expect(sendSlackMessageMock.notCalled).to.be.true;
    });

    it('should return false when channel name is missing', async () => {
        getInputMock
            .withArgs('cydigConfigPath', sinon.match.any)
            .returns(path.join(__dirname, 'CyDigConfigChannelNameMissing.json'));

        getInputMock.withArgs('slackAccessToken', sinon.match.any).returns('dummyToken');

        await expect(new MainService().run()).to.be.rejectedWith('Missing slack channel name in config');

        expect(fetchComplianceHistoryMock.notCalled).to.be.true;
        expect(sendSlackMessageMock.notCalled).to.be.true;
    });

    it('should handle malformed config file', async () => {
        getInputMock
            .withArgs('cydigConfigPath', sinon.match.any)
            .returns(path.join(__dirname, 'CyDigConfigMalformed.json'));
        getInputMock.withArgs('slackAccessToken', sinon.match.any).returns('dummyToken');

        await expect(new MainService().run()).to.be.rejectedWith(
            'Got the following error when trying to read config file:SyntaxError',
        );

        expect(fetchComplianceHistoryMock.notCalled).to.be.true;
        expect(sendSlackMessageMock.notCalled).to.be.true;
    });
});
