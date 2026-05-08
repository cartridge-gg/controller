import { describe, expect, it } from "vitest";
import { normalizeTurnkeyPublicKey } from "./turnkey_public_key";

const compressedPublicKey =
  "036b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296";

const uncompressedPublicKey =
  "046b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c2964fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5";

const jwkPublicKey = {
  kty: "EC",
  crv: "P-256",
  x: "axfR8uEsQkf4vOblY6RA8ncDfYEt6zOg9KE5RdiYwpY",
  y: "T-NC4v4af5uO5-tKfA-eFivOM1drMV7Oy7ZAaDe_UfU",
};

describe("normalizeTurnkeyPublicKey", () => {
  it("keeps compressed P-256 public keys as hex", () => {
    expect(normalizeTurnkeyPublicKey(compressedPublicKey)).toBe(
      compressedPublicKey,
    );
  });

  it("compresses uncompressed P-256 public keys", () => {
    expect(normalizeTurnkeyPublicKey(uncompressedPublicKey)).toBe(
      compressedPublicKey,
    );
  });

  it("compresses JWK P-256 public keys", () => {
    expect(normalizeTurnkeyPublicKey(jwkPublicKey)).toBe(compressedPublicKey);
  });

  it("compresses stringified JWK P-256 public keys", () => {
    expect(normalizeTurnkeyPublicKey(JSON.stringify(jwkPublicKey))).toBe(
      compressedPublicKey,
    );
  });

  it("rejects non-P-256 public keys", () => {
    expect(() =>
      normalizeTurnkeyPublicKey({ ...jwkPublicKey, crv: "secp256k1" }),
    ).toThrow("Turnkey iframe public key must be a P-256 public key");
  });
});
