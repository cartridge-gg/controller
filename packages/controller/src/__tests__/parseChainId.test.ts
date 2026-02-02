import { constants, shortString } from "starknet";
import { parseChainId } from "../utils";

describe("parseChainId", () => {
  describe("Starknet chains", () => {
    test("identifies mainnet", () => {
      expect(
        parseChainId(
          new URL("https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9"),
        ),
      ).toBe(constants.StarknetChainId.SN_MAIN);
    });

    test("identifies sepolia", () => {
      expect(
        parseChainId(
          new URL("https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9"),
        ),
      ).toBe(constants.StarknetChainId.SN_SEPOLIA);
    });
  });

  describe("Project-specific chains", () => {
    test("identifies slot chain", () => {
      expect(
        parseChainId(new URL("https://api.cartridge.gg/x/slot/katana")),
      ).toBe(shortString.encodeShortString("WP_SLOT"));
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

  describe("Non-Cartridge hosts", () => {
    test("returns placeholder chainId in Node", () => {
      expect(parseChainId(new URL("http://dl:123123"))).toBe(
        shortString.encodeShortString("LOCALHOST"),
      );
    });
  });

  describe("Error cases", () => {
    test("throws error for unsupported URL format", () => {
      expect(() =>
        parseChainId(new URL("https://api.cartridge.gg/unsupported")),
      ).toThrow("Chain https://api.cartridge.gg/unsupported not supported");
    });

    test("throws error for URLs without proper chain identifiers", () => {
      expect(() =>
        parseChainId(new URL("https://api.cartridge.gg/v1/starknet")),
      ).toThrow("Chain https://api.cartridge.gg/v1/starknet not supported");
    });
  });
});
