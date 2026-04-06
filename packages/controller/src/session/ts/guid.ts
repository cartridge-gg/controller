import { ec, encode, hash, num, shortString } from "starknet";
import type { Signer } from "./types";

const STARKNET_SIGNER_DOMAIN = num
  .toHex(shortString.encodeShortString("Starknet Signer"))
  .toLowerCase();

/**
 * Derives a session signer GUID from a Signer object.
 * Matches the WASM `signerToGuid` function signature exactly.
 */
export function signerToGuid(signer: Signer): string {
  const privateKey = signer.starknet?.privateKey;
  if (!privateKey) {
    throw new Error("Cannot derive session GUID: missing starknet private key");
  }

  const normalizedKey = encode.addHexPrefix(String(privateKey).trim());
  const publicKey = ec.starkCurve.getStarkKey(normalizedKey);

  return num
    .toHex(hash.computePoseidonHash(STARKNET_SIGNER_DOMAIN, publicKey))
    .toLowerCase();
}
