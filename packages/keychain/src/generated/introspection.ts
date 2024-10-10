export interface PossibleTypesResultData {
  possibleTypes: {
    [key: string]: string[];
  };
}
const result: PossibleTypesResultData = {
  possibleTypes: {
    DeploymentConfig: ["KatanaConfig", "SayaConfig", "ToriiConfig"],
    Node: [
      "Account",
      "AccountTeam",
      "Deployment",
      "DeploymentLog",
      "File",
      "Service",
      "StripePayments",
      "Team",
    ],
  },
};
export default result;
