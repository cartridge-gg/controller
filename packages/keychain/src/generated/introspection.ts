
      export interface PossibleTypesResultData {
        possibleTypes: {
          [key: string]: string[]
        }
      }
      const result: PossibleTypesResultData = {
  "possibleTypes": {
    "Attribute": [
      "NumberAttribute",
      "StringAttribute"
    ],
    "ContractMetadata": [
      "ERC20Metadata",
      "ERC721Metadata"
    ],
    "DeploymentConfig": [
      "KatanaConfig",
      "MadaraConfig",
      "ToriiConfig"
    ],
    "Node": [
      "Account",
      "AccountQuest",
      "AccountStarterPack",
      "AccountTeam",
      "Achievement",
      "Attestation",
      "Balance",
      "Block",
      "Class",
      "Contract",
      "Deployment",
      "DiscordGuild",
      "Event",
      "File",
      "Game",
      "Quest",
      "QuestEvent",
      "Scope",
      "Service",
      "StarterPack",
      "StarterPackContract",
      "StarterPackToken",
      "Team",
      "Token",
      "Transaction",
      "TransactionReceipt",
      "TwitterQuest"
    ],
    "TransactionMetadata": [
      "Call",
      "MultiCall"
    ]
  }
};
      export default result;
    