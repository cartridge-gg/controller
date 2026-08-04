const SUPPORTED_IMAGE_URI = /^(?:https?:\/\/|ipfs:\/\/|data:)/;

/**
 * Decode a malformed NFT image data URI whose payload is actually a nested
 * HTTP, IPFS, or data URI rather than image data. Some games (e.g. Glitch
 * Bomb) publish token metadata like
 * `data:image/svg+xml;base64,<base64 of a plain URL>`, which browsers cannot
 * decode as an image. Returns undefined for well-formed data URIs.
 *
 * Adapted from cartridge-gg/controller#2664.
 */
export function resolveNestedImageUri(imageUri: string): string | undefined {
  if (!imageUri.startsWith("data:")) return;

  const separator = imageUri.indexOf(",");
  if (separator === -1) return;

  const header = imageUri.slice(5, separator);
  const payload = imageUri.slice(separator + 1);

  try {
    const decoded = header.toLowerCase().split(";").includes("base64")
      ? new TextDecoder().decode(
          Uint8Array.from(atob(payload), (character) =>
            character.charCodeAt(0),
          ),
        )
      : decodeURIComponent(payload);
    const nestedUri = decoded.trim();

    return SUPPORTED_IMAGE_URI.test(nestedUri) ? nestedUri : undefined;
  } catch {
    return;
  }
}

/**
 * A metadata image URI with malformed nesting resolved: returns the nested
 * URI when the input is a data URI wrapping one, the input untouched
 * otherwise.
 */
export function resolveMetadataImage(imageUri?: string): string | undefined {
  if (!imageUri) return undefined;
  return resolveNestedImageUri(imageUri) ?? imageUri;
}
