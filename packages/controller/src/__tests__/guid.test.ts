import { ec, hash, num, shortString, encode } from "starknet";
import { signerToGuid } from "../session/ts/shared";

describe("signerToGuid", () => {
  test("produces a valid hex felt", () => {
    const guid = signerToGuid({
      starknet: { privateKey: "0x123" },
    });
    expect(guid).toMatch(/^0x[0-9a-f]+$/);
  });

  test("is deterministic for the same key", () => {
    const key = "0xdeadbeef";
    const guid1 = signerToGuid({ starknet: { privateKey: key } });
    const guid2 = signerToGuid({ starknet: { privateKey: key } });
    expect(guid1).toBe(guid2);
  });

  test("produces different GUIDs for different keys", () => {
    const guid1 = signerToGuid({ starknet: { privateKey: "0x1" } });
    const guid2 = signerToGuid({ starknet: { privateKey: "0x2" } });
    expect(guid1).not.toBe(guid2);
  });

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

  test("produces known GUID for well-known private key 0x1", () => {
    // Private key 0x1 has a well-known public key on the Stark curve
    const guid = signerToGuid({ starknet: { privateKey: "0x1" } });

    // Verify it's a valid felt (non-zero, hex)
    expect(guid).toMatch(/^0x[0-9a-f]+$/);
    expect(BigInt(guid)).toBeGreaterThan(0n);

    // Snapshot the value for regression detection
    expect(guid).toMatchInlineSnapshot(
      `"0x78e6eccfb97cea1b4ca2e0735d0db7cd9e33a316378391e58e7f3ed107062c2"`,
    );
  });
});
