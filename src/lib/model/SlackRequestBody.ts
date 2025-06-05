interface SlackTypeText {
    type: string;
    text: string;
}

interface SlackContextBlock {
    type?: string;
    elements?: SlackTypeText[];
    text?: SlackTypeText;
}

export interface SlackPostMessagePayload {
    channel: string;
    blocks: SlackContextBlock[];
}
