import { addAddressPadding, getChecksumAddress } from "starknet";
import { resolveNestedImageUri } from "./image-url";

/**
 * Resolve the Torii base URL — the single source of truth for how a Torii URL
 * is built across the keychain.
 *
 * A caller-provided `toriiUrl` (SDK `toriiUrl` option) takes precedence over the
 * default Slot URL derived from `project` (SDK `slot` option). Trailing slashes
 * are stripped so callers can safely append paths like `/static/...`.
 *
 * @param project - The Slot project name (from the `ps` URL param).
 * @param toriiUrl - An explicit Torii URL override (from the `torii` URL param).
 * @returns The resolved Torii base URL, or `null` when neither is available.
 */
export function getToriiUrl(
  project?: string | null,
  toriiUrl?: string | null,
): string | null {
  if (toriiUrl) return toriiUrl.replace(/\/+$/, "");
  if (project) return `https://api.cartridge.gg/x/${project}/torii`;
  return null;
}

/**
 * Torii serves static assets under the zero-padded, lowercase form of the
 * contract address; any other form 404s.
 */
function normalizeContractAddress(contractAddress: string): string {
  return getChecksumAddress(contractAddress).toLowerCase();
}

/**
 * Collection-level (contract) image served by Torii. Used as the last-resort
 * fallback when token-level images are missing or unreadable.
 *
 * @param toriiUrl - The resolved Torii base URL (see `getToriiUrl`).
 * @param contractAddress - The collection contract address, any hex form.
 */
export function getToriiCollectionImageUrl(
  toriiUrl: string,
  contractAddress: string,
): string {
  return `${toriiUrl}/static/${normalizeContractAddress(contractAddress)}/image`;
}

/**
 * Candidate token-level image URLs served by Torii, most canonical first.
 * The unpadded-address variant is kept for older Torii instances that stored
 * assets under the short hex form.
 *
 * @param toriiUrl - The resolved Torii base URL (see `getToriiUrl`).
 * @param contractAddress - The collection contract address, any hex form.
 * @param tokenId - The token id, any hex or decimal form.
 */
export function getToriiTokenImageUrls(
  toriiUrl: string,
  contractAddress: string,
  tokenId: string,
): string[] {
  const paddedTokenId = addAddressPadding(tokenId).toLowerCase();
  return [
    `${toriiUrl}/static/${normalizeContractAddress(contractAddress)}/${paddedTokenId}/image`,
    `${toriiUrl}/static/0x${BigInt(contractAddress).toString(16)}/${paddedTokenId}/image`,
  ];
}

/**
 * The standard fallback chain for a token image: token-level URLs first, then
 * the token metadata image, then the collection-level image. This mirrors the
 * chain used by the asset page preview, which is the reference behavior.
 *
 * When the metadata image is a malformed data URI wrapping a plain URL (see
 * `resolveNestedImageUri`), the decoded URL is the image the game intended,
 * so it is promoted ahead of the Torii candidates (cartridge-gg/controller#2664).
 */
export function getTokenImageFallbacks(
  toriiUrl: string,
  contractAddress: string,
  tokenId: string,
  metadataImage?: string,
): string[] {
  const nestedUri = metadataImage
    ? resolveNestedImageUri(metadataImage)
    : undefined;
  return [
    ...(nestedUri ? [nestedUri] : []),
    ...getToriiTokenImageUrls(toriiUrl, contractAddress, tokenId),
    ...(!nestedUri && metadataImage ? [metadataImage] : []),
    getToriiCollectionImageUrl(toriiUrl, contractAddress),
  ];
}
