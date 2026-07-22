const SUPPORTED_IMAGE_URI = /^(?:https?:\/\/|ipfs:\/\/|data:)/;

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

export function getImageUrlCandidates(
  toriiImageUrls: string[],
  metadataImageUri = "",
): string[] {
  const nestedUri = resolveNestedImageUri(metadataImageUri);

  return nestedUri
    ? [nestedUri, ...toriiImageUrls]
    : [...toriiImageUrls, metadataImageUri];
}
