import { constants, shortString } from "starknet";
import { parseChainId } from "../utils";

describe("parseChainId", () => {
  describe("Starknet chains", () => {
    test("identifies mainnet", () => {
      expect(
        parseChainId(new URL("https://api.cartridge.gg/x/starknet/mainnet")),
      ).toBe(constants.StarknetChainId.SN_MAIN);
    });

    test("identifies sepolia", () => {
      expect(
        parseChainId(new URL("https://api.cartridge.gg/x/starknet/sepolia")),
      ).toBe(constants.StarknetChainId.SN_SEPOLIA);
    });
  });

  describe("Project-specific chains", () => {
    test("identifies slot chain", () => {
      expect(
        parseChainId(new URL("https://api.cartridge.gg/x/slot/katana")),
      ).toBe(shortString.encodeShortString("WP_SLOT"));
    });

    test("identifies slot chain on localhost", () => {
      expect(parseChainId(new URL("http://localhost:8001/x/slot/katana"))).toBe(
        shortString.encodeShortString("WP_SLOT"),
      );
    });

    test("identifies slot chain with hyphenated name", () => {
      expect(
        parseChainId(
          new URL("https://api.cartridge.gg/x/my-slot-chain/katana"),
        ),
      ).toBe(shortString.encodeShortString("WP_MY_SLOT_CHAIN"));
    });

    test("identifies slot mainnet chain", () => {
      expect(
        parseChainId(new URL("https://api.cartridge.gg/x/slot/mainnet")),
      ).toBe(shortString.encodeShortString("GG_SLOT"));
    });
  });

  describe("Error cases", () => {
    test("throws error for unsupported URL format", () => {
      expect(() =>
        parseChainId(new URL("https://api.example.com/unsupported")),
      ).toThrow("Chain https://api.example.com/unsupported not supported");
    });

    test("throws error for URLs without proper chain identifiers", () => {
      expect(() =>
        parseChainId(new URL("https://api.example.com/v1/starknet")),
      ).toThrow("Chain https://api.example.com/v1/starknet not supported");
    });
  });
});
