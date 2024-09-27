export interface PossibleTypesResultData {
  possibleTypes: {
    [key: string]: string[];
  };
}
const result: PossibleTypesResultData = {
  possibleTypes: {
    DeploymentConfig: [
      "KatanaConfig",
      "MadaraConfig",
      "SayaConfig",
      "ToriiConfig",
    ],
    Node: [
      "Account",
      "AccountTeam",
      "Deployment",
      "DeploymentLog",
      "File",
      "Service",
      "Team",
    ],
  },
};
export default result;
