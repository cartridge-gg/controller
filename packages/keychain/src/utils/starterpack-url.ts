import { StarterPack } from "@cartridge/controller";

/**
 * Encodes a StarterPack object to a base64 URL-safe string
 */
export function encodeStarterPack(starterPack: StarterPack): string {
  try {
    // Convert BigInt values to strings for JSON serialization
    const serializable = {
      ...starterPack,
      items: starterPack.items.map((item) => ({
        ...item,
        price: item.price?.toString(),
      })),
    };

    const json = JSON.stringify(serializable);
    // Use base64url encoding (URL-safe)
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  } catch (error) {
    console.error("Failed to encode StarterPack:", error);
    throw new Error("Invalid StarterPack data");
  }
}

/**
 * Decodes a base64 URL-safe string back to a StarterPack object
 */
export function decodeStarterPack(encoded: string): StarterPack {
  try {
    // Add padding and convert back from base64url
    const padded = encoded + "=".repeat((4 - (encoded.length % 4)) % 4);
    const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");

    const json = atob(base64);
    const parsed = JSON.parse(json);

    // Convert price strings back to BigInt
    const starterPack: StarterPack = {
      ...parsed,
      items: parsed.items.map((item: Record<string, unknown>) => ({
        ...item,
        price: item.price ? BigInt(item.price as string) : undefined,
      })),
    };

    return starterPack;
  } catch (error) {
    console.error("Failed to decode StarterPack:", error);
    throw new Error("Invalid encoded StarterPack data");
  }
}
