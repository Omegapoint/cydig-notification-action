export interface CyDigConfig {
  teamName: string;
  communicationTool: {
    nameOfTool: string;
    slack: {
      channelName: string;
      isPrivate: boolean;
    };
  };
}
