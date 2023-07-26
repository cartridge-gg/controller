export interface PossibleTypesResultData {
  possibleTypes: {
    [key: string]: string[];
  };
}
const result: PossibleTypesResultData = {
  possibleTypes: {
    Attribute: ["NumberAttribute", "StringAttribute"],
    ContractMetadata: ["ERC20Metadata", "ERC721Metadata"],
    Node: [
      "Account",
      "AccountQuest",
      "AccountStarterPack",
      "Achievement",
      "Attestation",
      "Balance",
      "Block",
      "Class",
      "Contract",
      "DiscordGuild",
      "Event",
      "File",
      "Game",
      "Quest",
      "QuestEvent",
      "Scope",
      "StarterPack",
      "StarterPackContract",
      "StarterPackToken",
      "Token",
      "Transaction",
      "TransactionReceipt",
      "TwitterQuest",
    ],
    TransactionMetadata: ["Call", "MultiCall"],
  },
};
export default result;
