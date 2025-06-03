export class ComplianceHistory {
  teamName: string;
  currentCompliance: ComplianceScore;
  previousCompliance: ComplianceScore;

  constructor(
    teamName: string,
    currentCompliance: ComplianceScore,
    previousCompliance: ComplianceScore,
  ) {
    this.teamName = teamName;
    this.currentCompliance = currentCompliance;
    this.previousCompliance = previousCompliance;
  }

  public currentPercentage(): number {
    return (
      (this.currentCompliance.score / this.currentCompliance.maxScore) * 100
    );
  }

  public previousPercentage(): number {
    return (
      (this.previousCompliance.score / this.previousCompliance.maxScore) * 100
    );
  }

  public shouldSendAlert(): boolean {
    return this.currentPercentage() < this.previousPercentage();
  }

  public percentageDrop(): number {
    return this.previousPercentage() - this.currentPercentage();
  }
}

interface ComplianceScore {
  date: string;
  score: number;
  maxScore: number;
}
