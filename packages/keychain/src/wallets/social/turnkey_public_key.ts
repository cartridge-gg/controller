import {
  normalizePadding,
  pointEncode,
  uint8ArrayFromHexString,
  uint8ArrayToHexString,
} from "@turnkey/encoding";

const COMPRESSED_P256_PUBLIC_KEY_HEX = /^(02|03)[0-9a-fA-F]{64}$/;
const UNCOMPRESSED_P256_PUBLIC_KEY_HEX = /^04[0-9a-fA-F]{128}$/;

type P256PublicJwk = {
  kty?: unknown;
  crv?: unknown;
  x?: unknown;
  y?: unknown;
};

export function normalizeTurnkeyPublicKey(publicKey: unknown): string {
  if (typeof publicKey === "string") {
    const value = publicKey.trim();

    if (value.startsWith("{")) {
      return normalizeTurnkeyPublicKey(JSON.parse(value));
    }

    const hex = value.startsWith("0x") ? value.slice(2) : value;
    if (COMPRESSED_P256_PUBLIC_KEY_HEX.test(hex)) {
      return uint8ArrayToHexString(uint8ArrayFromHexString(hex, 33));
    }

    if (UNCOMPRESSED_P256_PUBLIC_KEY_HEX.test(hex)) {
      return uint8ArrayToHexString(
        pointEncode(uint8ArrayFromHexString(hex, 65)),
      );
    }
  }

  if (isP256PublicJwk(publicKey)) {
    return uint8ArrayToHexString(
      pointEncode(
        new Uint8Array([
          0x04,
          ...base64UrlToPaddedBytes(publicKey.x, 32),
          ...base64UrlToPaddedBytes(publicKey.y, 32),
        ]),
      ),
    );
  }

  throw new Error("Turnkey iframe public key must be a P-256 public key");
}

function isP256PublicJwk(value: unknown): value is Required<P256PublicJwk> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const jwk = value as P256PublicJwk;
  return jwk.kty === "EC" && jwk.crv === "P-256";
}

function base64UrlToPaddedBytes(value: unknown, length: number): Uint8Array {
  if (typeof value !== "string") {
    throw new Error("Turnkey public key JWK is missing coordinates");
  }

  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

  return normalizePadding(bytes, length);
}
