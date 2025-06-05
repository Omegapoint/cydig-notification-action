export default interface ComplianceHistoryDTO {
    teamName: string;
    currentCompliance: ComplianceScoreDTO;
    previousCompliance: ComplianceScoreDTO;
}

interface ComplianceScoreDTO {
    date: string;
    score: number;
    maxScore: number;
}
