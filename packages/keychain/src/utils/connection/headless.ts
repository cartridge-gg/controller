import {
  HeadlessCredentialData,
  ConnectReply,
  ConnectError,
  ResponseCodes,
} from "@cartridge/controller";
import { fetchController } from "@/components/connect/create/utils";
import { decryptPrivateKey } from "@/components/connect/create/password/crypto";
import { Signer } from "@cartridge/controller-wasm";
import Controller from "@/utils/controller";
import { constants } from "starknet";
import { DEFAULT_SESSION_DURATION, now } from "@/constants";

/**
 * Authenticates a user in headless mode without showing UI.
 *
 * This function handles programmatic authentication by:
 * 1. Fetching the user's controller data from the backend
 * 2. Authenticating with the provided credentials
 * 3. Creating or loading the Controller instance
 * 4. Returning the account address
 *
 * @param username - The username to authenticate
 * @param credentials - The credentials for authentication
 * @param chainId - The chain ID to use (defaults to mainnet)
 * @returns Promise resolving to ConnectReply on success
 */
export async function authenticateHeadless(
  username: string,
  credentials: HeadlessCredentialData,
  chainId?: string,
): Promise<ConnectReply | ConnectError> {
  try {
    // Default to mainnet if no chain ID provided
    const effectiveChainId = chainId || constants.StarknetChainId.SN_MAIN;

    switch (credentials.type) {
      case "password":
        return await authenticateWithPassword(
          username,
          credentials.password,
          effectiveChainId,
        );

      case "webauthn":
        return await authenticateWithWebAuthn(
          username,
          credentials,
          effectiveChainId,
        );

      case "google":
      case "discord":
      case "metamask":
      case "rabby":
      case "phantom-evm":
        return await authenticateWithEIP191(
          username,
          credentials,
          effectiveChainId,
        );

      case "argent":
      case "braavos":
      case "siws":
        return {
          code: ResponseCodes.ERROR,
          message: `${credentials.type} authentication not yet implemented in headless mode`,
        } as ConnectError;

      default:
        return {
          code: ResponseCodes.ERROR,
          message: "Unknown credential type",
        } as ConnectError;
    }
  } catch (error) {
    console.error("Headless authentication failed:", error);
    return {
      code: ResponseCodes.ERROR,
      message: error instanceof Error ? error.message : "Authentication failed",
    } as ConnectError;
  }
}

/**
 * Authenticates with password credentials
 *
 * @param username - The username to authenticate
 * @param password - The password to decrypt the private key
 * @param chainId - The chain ID to use
 * @returns Promise resolving to ConnectReply on success
 */
async function authenticateWithPassword(
  username: string,
  password: string,
  chainId: string,
): Promise<ConnectReply | ConnectError> {
  try {
    // 1. Fetch controller data from backend
    const controllerData = await fetchController(chainId, username);
    if (!controllerData?.controller) {
      return {
        code: ResponseCodes.ERROR,
        message: `Controller not found for username: ${username}`,
      } as ConnectError;
    }

    const controller = controllerData.controller;

    // 2. Find the password signer from the controller's signers
    const passwordSigners = controller.signers?.filter(
      (signer) =>
        (signer.metadata as { __typename?: string }).__typename ===
        "PasswordCredentials",
    );

    if (!passwordSigners || passwordSigners.length === 0) {
      return {
        code: ResponseCodes.ERROR,
        message: "Password authentication not available for this account",
      } as ConnectError;
    }

    // 3. Extract the encrypted private key from metadata
    const passwordMetadata = passwordSigners[0].metadata as {
      __typename: string;
      password?: Array<{
        encryptedPrivateKey: string;
        publicKey: string;
      }>;
    };

    const encryptedPrivateKey =
      passwordMetadata.password?.[0]?.encryptedPrivateKey;

    if (!encryptedPrivateKey) {
      return {
        code: ResponseCodes.ERROR,
        message: "Encrypted private key not found",
      } as ConnectError;
    }

    // 4. Decrypt the private key using the password
    let privateKey: string;
    try {
      privateKey = await decryptPrivateKey(encryptedPrivateKey, password);
    } catch {
      return {
        code: ResponseCodes.ERROR,
        message: "Invalid password or corrupted key",
      } as ConnectError;
    }

    // 5. Create a signer with the decrypted private key
    const signer: Signer = {
      starknet: {
        privateKey,
      },
    };

    // 6. Get RPC URL for the chain
    const rpcUrl = getRpcUrlForChain(chainId);

    // 7. Login to create controller instance
    const loginResult = await Controller.login({
      appId: "headless",
      rpcUrl,
      username: controller.accountID,
      classHash: controller.constructorCalldata[0],
      address: controller.address,
      owner: {
        signer,
      },
      cartridgeApiUrl: import.meta.env.VITE_CARTRIDGE_API_URL,
      session_expires_at_s: Number(now() + DEFAULT_SESSION_DURATION),
      isControllerRegistered: true,
    });

    // 8. Store the controller
    window.controller = loginResult.controller;

    // 9. Return success with address
    return {
      code: ResponseCodes.SUCCESS,
      address: loginResult.controller.address(),
    } as ConnectReply;
  } catch (error) {
    console.error("Password authentication error:", error);
    return {
      code: ResponseCodes.ERROR,
      message: error instanceof Error ? error.message : "Authentication failed",
    } as ConnectError;
  }
}

/**
 * Authenticates with WebAuthn credentials
 *
 * @param username - The username to authenticate
 * @param credentials - The WebAuthn credentials
 * @param chainId - The chain ID to use
 * @returns Promise resolving to ConnectReply on success
 */
async function authenticateWithWebAuthn(
  username: string,
  credentials: Extract<HeadlessCredentialData, { type: "webauthn" }>,
  chainId: string,
): Promise<ConnectReply | ConnectError> {
  try {
    // 1. Fetch controller data from backend
    const controllerData = await fetchController(chainId, username);
    if (!controllerData?.controller) {
      return {
        code: ResponseCodes.ERROR,
        message: `Controller not found for username: ${username}`,
      } as ConnectError;
    }

    const controller = controllerData.controller;

    // 2. Create signer with WebAuthn credentials
    const signer: Signer = {
      webauthn: {
        rpId: import.meta.env.VITE_RP_ID,
        credentialId: credentials.credentialId,
        publicKey: credentials.publicKey,
      },
    };

    // 3. Get RPC URL for the chain
    const rpcUrl = getRpcUrlForChain(chainId);

    // 4. Login to create controller instance
    const loginResult = await Controller.login({
      appId: "headless",
      rpcUrl,
      username: controller.accountID,
      classHash: controller.constructorCalldata[0],
      address: controller.address,
      owner: {
        signer,
      },
      cartridgeApiUrl: import.meta.env.VITE_CARTRIDGE_API_URL,
      session_expires_at_s: Number(now() + DEFAULT_SESSION_DURATION),
      isControllerRegistered: true,
    });

    // 5. Store the controller
    window.controller = loginResult.controller;

    // 6. Return success with address
    return {
      code: ResponseCodes.SUCCESS,
      address: loginResult.controller.address(),
    } as ConnectReply;
  } catch (error) {
    console.error("WebAuthn authentication error:", error);
    return {
      code: ResponseCodes.ERROR,
      message: error instanceof Error ? error.message : "Authentication failed",
    } as ConnectError;
  }
}

/**
 * Authenticates with EIP-191 credentials (Google, Discord, MetaMask, etc.)
 *
 * @param username - The username to authenticate
 * @param credentials - The EIP-191 credentials
 * @param chainId - The chain ID to use
 * @returns Promise resolving to ConnectReply on success
 */
async function authenticateWithEIP191(
  username: string,
  credentials: Extract<
    HeadlessCredentialData,
    | { type: "google" }
    | { type: "discord" }
    | { type: "metamask" }
    | { type: "rabby" }
    | { type: "phantom-evm" }
  >,
  chainId: string,
): Promise<ConnectReply | ConnectError> {
  try {
    // 1. Fetch controller data from backend
    const controllerData = await fetchController(chainId, username);
    if (!controllerData?.controller) {
      return {
        code: ResponseCodes.ERROR,
        message: `Controller not found for username: ${username}`,
      } as ConnectError;
    }

    const controller = controllerData.controller;

    // 2. Create signer with EIP-191 credentials
    const signer: Signer = {
      eip191: {
        address: credentials.address,
      },
    };

    // 3. Get RPC URL for the chain
    const rpcUrl = getRpcUrlForChain(chainId);

    // 4. Login to create controller instance
    const loginResult = await Controller.login({
      appId: "headless",
      rpcUrl,
      username: controller.accountID,
      classHash: controller.constructorCalldata[0],
      address: controller.address,
      owner: {
        signer,
      },
      cartridgeApiUrl: import.meta.env.VITE_CARTRIDGE_API_URL,
      session_expires_at_s: Number(now() + DEFAULT_SESSION_DURATION),
      isControllerRegistered: true,
    });

    // 5. Store the controller
    window.controller = loginResult.controller;

    // 6. Return success with address
    return {
      code: ResponseCodes.SUCCESS,
      address: loginResult.controller.address(),
    } as ConnectReply;
  } catch (error) {
    console.error(`${credentials.type} authentication error:`, error);
    return {
      code: ResponseCodes.ERROR,
      message: error instanceof Error ? error.message : "Authentication failed",
    } as ConnectError;
  }
}

/**
 * Helper function to get RPC URL for a given chain ID
 *
 * @param chainId - The chain ID
 * @returns The RPC URL for the chain
 */
function getRpcUrlForChain(chainId: string): string {
  switch (chainId) {
    case constants.StarknetChainId.SN_MAIN:
      return "https://api.cartridge.gg/x/starknet/mainnet";
    case constants.StarknetChainId.SN_SEPOLIA:
      return "https://api.cartridge.gg/x/starknet/sepolia";
    default:
      // Default to mainnet if unknown chain ID
      return "https://api.cartridge.gg/x/starknet/mainnet";
  }
}
