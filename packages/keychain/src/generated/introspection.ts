
      export interface PossibleTypesResultData {
        possibleTypes: {
          [key: string]: string[]
        }
      }
      const result: PossibleTypesResultData = {
  "possibleTypes": {
    "DeploymentConfig": [
      "KatanaConfig",
      "SayaConfig",
      "ToriiConfig"
    ],
    "Node": [
      "Account",
      "AccountTeam",
      "Controller",
      "CreditsHistory",
      "Deployment",
      "DeploymentLog",
      "File",
      "Service",
      "Signer",
      "StripePayments",
      "Team"
    ]
  }
};
      export default result;
    