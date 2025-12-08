import { AuthOption } from "@cartridge/controller";
import Controller from "./controller";
import { fetchController } from "@/components/connect/create/utils";
import { AUTH_METHODS_LABELS } from "./connection/constants";
import {
  ArgentColorIcon,
  BraavosColorIcon,
  DiscordColorIcon,
  GoogleColorIcon,
  IconProps,
  LockIcon,
  MetaMaskColorIcon,
  PasskeyIcon,
  PhantomColorIcon,
  RabbyColorIcon,
  WalletConnectColorIcon,
} from "@cartridge/ui";
import { ComponentType } from "react";

/**
 * Gets a user-friendly display name for an authentication method
 */
export function getAuthMethodDisplayName(authMethod?: AuthOption): string {
  if (!authMethod) {
    return "your account";
  }

  return AUTH_METHODS_LABELS[authMethod] || "your account";
}

/**
 * Gets the icon component for an authentication method
 */
export function getAuthMethodIcon(
  authMethod?: AuthOption,
): ComponentType<IconProps> | undefined {
  if (!authMethod) {
    return undefined;
  }

  switch (authMethod) {
    case "webauthn":
      return PasskeyIcon;
    case "google":
      return GoogleColorIcon;
    case "discord":
      return DiscordColorIcon;
    case "walletconnect":
      return WalletConnectColorIcon;
    case "metamask":
      return MetaMaskColorIcon;
    case "rabby":
      return RabbyColorIcon;
    case "phantom":
    case "phantom-evm":
      return PhantomColorIcon;
    case "argent":
      return ArgentColorIcon;
    case "braavos":
      return BraavosColorIcon;
    case "password":
      return LockIcon;
    case "base":
    default:
      return undefined;
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
