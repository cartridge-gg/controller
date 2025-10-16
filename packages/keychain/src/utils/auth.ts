import { AuthOption } from "@cartridge/controller";
import Controller from "./controller";
import { fetchController } from "@/components/connect/create/utils";

/**
 * Gets a user-friendly display name for an authentication method
 */
export function getAuthMethodDisplayName(authMethod?: AuthOption): string {
  if (!authMethod) {
    return "your account";
  }

  switch (authMethod) {
    case "webauthn":
      return "Passkey";
    case "google":
      return "Google";
    case "discord":
      return "Discord";
    case "walletconnect":
      return "WalletConnect";
    case "password":
      return "Password";
    case "phantom":
      return "Phantom";
    case "metamask":
      return "MetaMask";
    case "rabby":
      return "Rabby";
    case "argent":
      return "Argent";
    case "braavos":
      return "Braavos";
    case "base":
      return "Base";
    default:
      return "your account";
  }
}

/**
 * Detects the primary authentication method for a controller
 */
export async function detectAuthMethod(
  controller: Controller,
  chainId: string,
): Promise<AuthOption | undefined> {
  try {
    const username = controller.username();
    if (!username) {
      return undefined;
    }

    const controllerQuery = await fetchController(
      chainId,
      username,
      new AbortController().signal,
    );

    if (!controllerQuery.controller?.signers) {
      return undefined;
    }

    // Find the first active (non-revoked) signer
    const primarySigner = controllerQuery.controller.signers.find(
      (signer) => !signer.isRevoked,
    );

    if (!primarySigner?.metadata) {
      return undefined;
    }

    // Extract auth method from metadata
    const metadata = primarySigner.metadata;
    switch (metadata.__typename) {
      case "Eip191Credentials":
        return metadata.eip191?.[0]?.provider as AuthOption;
      case "WebauthnCredentials":
        return "webauthn";
      case "SIWSCredentials":
        return "phantom";
      case "StarknetCredentials":
        return "argent";
      case "PasswordCredentials":
        return "password";
      default:
        return undefined;
    }
  } catch (error) {
    console.error("Failed to detect auth method:", error);
    return undefined;
  }
}
