import { STRK_CONTRACT_ADDRESS } from "@cartridge/controller-ui/utils";
import { DEFAULT_TOKENS } from "@/components/provider/tokens";
import { getCachedTokenMetadata } from "./token-metadata";

describe("token metadata", () => {
  it("keeps the full Starknet Token name", () => {
    expect(getCachedTokenMetadata(STRK_CONTRACT_ADDRESS)).toMatchObject({
      name: "Starknet Token",
      symbol: "STRK",
    });
    expect(
      DEFAULT_TOKENS.find(({ symbol }) => symbol === "STRK"),
    ).toMatchObject({
      name: "Starknet Token",
      symbol: "STRK",
    });
  });
});
