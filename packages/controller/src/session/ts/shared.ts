import {
  addAddressPadding,
  ec,
  encode,
  hash,
  num,
  shortString,
} from "starknet";
import type { Signer } from "./types";

/**
 * Normalize a felt value to a lowercase hex string.
 */
export function normalizeFelt(value: string | number | bigint): string {
  return num.toHex(value).toLowerCase();
}

/**
 * Derive a Starknet selector from an entrypoint name or hex selector.
 */
export function selectorFromEntrypoint(entrypoint: string): string {
  if (/^0x[0-9a-f]+$/i.test(entrypoint)) {
    return normalizeFelt(entrypoint);
  }
  return normalizeFelt(hash.getSelectorFromName(entrypoint));
}

/**
 * Normalize and pad a Starknet contract address.
 */
export function normalizeContractAddress(
  address: string,
  context: string,
): string {
  const trimmed = address.trim();
  if (!trimmed) {
    throw new Error(`${context} is missing a contract address.`);
  }
  return addAddressPadding(trimmed.toLowerCase());
}

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
