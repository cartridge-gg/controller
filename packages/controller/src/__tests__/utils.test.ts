import { ec, hash, num, shortString, encode } from "starknet";
import {
  normalizeFelt,
  selectorFromEntrypoint,
  normalizeContractAddress,
  signerToGuid,
} from "../session/internal/utils";

describe("normalizeFelt", () => {
  test("normalizes hex string to lowercase", () => {
    expect(normalizeFelt("0xDEAD")).toBe("0xdead");
  });

  test("strips leading zeros from hex string", () => {
    expect(normalizeFelt("0x00ff")).toBe("0xff");
  });

  test("handles zero", () => {
    expect(normalizeFelt(0)).toBe("0x0");
  });
});

describe("selectorFromEntrypoint", () => {
  test("computes selector from entrypoint name", () => {
    const selector = selectorFromEntrypoint("transfer");
    const expected = normalizeFelt(hash.getSelectorFromName("transfer"));
    expect(selector).toBe(expected);
  });

  test("passes through hex selector unchanged", () => {
    const hexSelector =
      "0x83afd3f4caedc6eebf44246fe54e38c95e3179a5ec9ea81740eca5b482d12e";
    expect(selectorFromEntrypoint(hexSelector)).toBe(
      normalizeFelt(hexSelector),
    );
  });
});

describe("normalizeContractAddress", () => {
  test("pads short address to full length", () => {
    const result = normalizeContractAddress("0x1234", "test");
    expect(result).toMatch(/^0x0+1234$/);
    expect(result.length).toBe(66); // 0x + 64 hex chars
  });

  test("lowercases address", () => {
    const result = normalizeContractAddress("0xABCD", "test");
    expect(result).toBe(normalizeContractAddress("0xabcd", "test"));
  });

  test("trims whitespace", () => {
    const result = normalizeContractAddress("  0x1234  ", "test");
    expect(result).toBe(normalizeContractAddress("0x1234", "test"));
  });

  test("throws for empty address", () => {
    expect(() => normalizeContractAddress("", "target")).toThrow(
      "target is missing a contract address",
    );
  });

  test("throws for whitespace-only address", () => {
    expect(() => normalizeContractAddress("   ", "target")).toThrow(
      "target is missing a contract address",
    );
  });
});

describe("signerToGuid", () => {
  test("matches manual Poseidon(domain, publicKey) computation", () => {
    const privateKey = "0x1";
    const publicKey = ec.starkCurve.getStarkKey(
      encode.addHexPrefix(privateKey),
    );
    const domain = num.toHex(shortString.encodeShortString("Starknet Signer"));
    const expected = num
      .toHex(hash.computePoseidonHash(domain, publicKey))
      .toLowerCase();

    const guid = signerToGuid({ starknet: { privateKey } });
    expect(guid).toBe(expected);
  });

  test("handles keys with and without hex prefix", () => {
    const guid1 = signerToGuid({ starknet: { privateKey: "0x123" } });
    const guid2 = signerToGuid({ starknet: { privateKey: "123" } });
    expect(guid1).toBe(guid2);
  });

  test("throws for missing starknet signer", () => {
    expect(() => signerToGuid({})).toThrow();
  });

  test("throws for empty private key", () => {
    expect(() => signerToGuid({ starknet: { privateKey: "" } })).toThrow();
  });
});
