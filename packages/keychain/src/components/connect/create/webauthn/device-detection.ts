import { WebauthnCredential } from "@cartridge/ui/utils/api/cartridge";
import base64url from "base64url";

export async function findAvailableCredential(
  credentials: WebauthnCredential[],
  rpId: string,
): Promise<WebauthnCredential | undefined> {
  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const credentialIdBuffers = credentials.map((credential) =>
      base64url.toBuffer(credential.id),
    );

    const availableCredential = await navigator.credentials.get({
      publicKey: {
        challenge: challenge as BufferSource,
        timeout: 60000,
        rpId,
        allowCredentials: credentialIdBuffers.map((credentialIdBuffer) => ({
          type: "public-key",
          id: credentialIdBuffer as BufferSource,
        })),
        userVerification: "required",
      },
    });

    return credentials.find(
      (credential) => availableCredential?.id === credential.id,
    );
  } catch (error) {
    console.error("Error testing credential:", error);
  }

  return undefined;
}
