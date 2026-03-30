"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceHistory = void 0;
class ComplianceHistory {
    teamName;
    currentCompliance;
    previousCompliance;
    constructor(teamName, currentCompliance, previousCompliance) {
        this.teamName = teamName;
        this.currentCompliance = currentCompliance;
        this.previousCompliance = previousCompliance;
    }
    currentPercentage() {
        return (this.currentCompliance.score / this.currentCompliance.maxScore) * 100;
    }
    previousPercentage() {
        return (this.previousCompliance.score / this.previousCompliance.maxScore) * 100;
    }
    shouldSendAlert() {
        return this.currentPercentage() < this.previousPercentage();
    }
    percentageDrop() {
        return this.previousPercentage() - this.currentPercentage();
    }
}
exports.ComplianceHistory = ComplianceHistory;
//# sourceMappingURL=ComplianceHistory.js.map