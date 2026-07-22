import { describe, expect, it } from "vitest";
import {
  getTokenImageFallbacks,
  getToriiCollectionImageUrl,
  getToriiTokenImageUrls,
  getToriiUrl,
} from "./torii-url";

describe("getToriiUrl compatibility", () => {
  it("uses an explicit Torii URL ahead of the legacy Slot project", () => {
    expect(
      getToriiUrl(
        "legacy-game",
        "https://torii.example.com/custom/indexer////",
      ),
    ).toBe("https://torii.example.com/custom/indexer");
  });

  it("normalizes an explicit Torii URL without changing its path", () => {
    expect(getToriiUrl(null, "https://torii.example.com/a/b///")).toBe(
      "https://torii.example.com/a/b",
    );
  });

  it("keeps the Slot-derived fallback used by Controller 0.13.12", () => {
    expect(getToriiUrl("legacy-game", null)).toBe(
      "https://api.cartridge.gg/x/legacy-game/torii",
    );
  });

  it("returns null when neither protocol generation configures Torii", () => {
    expect(getToriiUrl(null, null)).toBeNull();
  });
});

const TORII_URL = "https://api.cartridge.gg/x/gbomb-mainnet/torii";
const CONTRACT_ADDRESS =
  "0x10cf2e2beb27753b7b46248d211614a6c3e4593371716cec9b952e43aaadd6";
const NORMALIZED_CONTRACT_ADDRESS =
  "0x0010cf2e2beb27753b7b46248d211614a6c3e4593371716cec9b952e43aaadd6";
const TOKEN_ID =
  "0x000000000000000000000000000000000000000000000000000000000000001a";

describe("getToriiCollectionImageUrl", () => {
  it("zero-pads and lowercases the contract address", () => {
    expect(getToriiCollectionImageUrl(TORII_URL, CONTRACT_ADDRESS)).toBe(
      `${TORII_URL}/static/${NORMALIZED_CONTRACT_ADDRESS}/image`,
    );
  });
});

describe("getToriiTokenImageUrls", () => {
  it("returns the padded URL first and the legacy unpadded URL second", () => {
    expect(
      getToriiTokenImageUrls(TORII_URL, CONTRACT_ADDRESS, TOKEN_ID),
    ).toEqual([
      `${TORII_URL}/static/${NORMALIZED_CONTRACT_ADDRESS}/${TOKEN_ID}/image`,
      `${TORII_URL}/static/${CONTRACT_ADDRESS}/${TOKEN_ID}/image`,
    ]);
  });

  it("pads short token ids", () => {
    expect(
      getToriiTokenImageUrls(TORII_URL, NORMALIZED_CONTRACT_ADDRESS, "0x1a")[0],
    ).toBe(
      `${TORII_URL}/static/${NORMALIZED_CONTRACT_ADDRESS}/${TOKEN_ID}/image`,
    );
  });
});

describe("getTokenImageFallbacks", () => {
  it("ends with the collection image so token failures fall back to it", () => {
    const urls = getTokenImageFallbacks(
      TORII_URL,
      CONTRACT_ADDRESS,
      TOKEN_ID,
      "ipfs://metadata-image",
    );
    expect(urls).toEqual([
      `${TORII_URL}/static/${NORMALIZED_CONTRACT_ADDRESS}/${TOKEN_ID}/image`,
      `${TORII_URL}/static/${CONTRACT_ADDRESS}/${TOKEN_ID}/image`,
      "ipfs://metadata-image",
      `${TORII_URL}/static/${NORMALIZED_CONTRACT_ADDRESS}/image`,
    ]);
  });

  it("omits the metadata entry when absent", () => {
    expect(
      getTokenImageFallbacks(TORII_URL, CONTRACT_ADDRESS, TOKEN_ID),
    ).toHaveLength(3);
  });
});
