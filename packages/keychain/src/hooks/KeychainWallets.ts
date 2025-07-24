import { getAddress } from "ethers";
import { ExternalWalletResponse, WalletAdapter } from "@cartridge/controller";
import { ParentMethods } from "./connection";

/**
 * Service running in the keychain iframe to handle signing requests.
 * It decides whether to use an embedded wallet or delegate to the
 * external WalletBridge in the parent controller window via penpal.
 */
export class KeychainWallets {
  private parent: ParentMethods;
  private embeddedWalletsByAddress: Map<string, WalletAdapter> = new Map();

  // Method to set the parent connection once established
  constructor(parent: ParentMethods) {
    this.parent = parent;
  }

  /**
   * Adds an embedded wallet to the map of embedded wallets.
   * @param address - The address of the embedded wallet.
   * @param wallet - The wallet adapter instance.
   */
  addEmbeddedWallet(address: string, wallet: WalletAdapter) {
    this.embeddedWalletsByAddress.set(getAddress(address), wallet);
  }

  /**
   * Gets an embedded wallet from the map of embedded wallets.
   * @param address - The address of the embedded wallet.
   * @returns The wallet adapter instance or undefined if not found.
   */
  getEmbeddedWallet(address: string): WalletAdapter | undefined {
    return this.embeddedWalletsByAddress.get(getAddress(address));
  }

  /**
   * Signs a message using either an embedded wallet or the external bridge.
   * @param identifier - The identifier (e.g., address) of the wallet.
   * @param message - The message hex string to sign.
   * @returns Promise resolving to the signature hex string.
   * @throws Error if signing fails or the connection isn't ready.
   */
  async signMessage(
    identifier: string,
    message: string,
  ): Promise<ExternalWalletResponse> {
    // --- Decision Logic ---
    const embeddedWallet = this.getEmbeddedWallet(identifier);

    if (embeddedWallet) {
      // --- Embedded Wallet Path ---
      const response = await embeddedWallet.signMessage?.(message);
      if (!response?.success) {
        throw new Error(
          `Failed to sign message with embedded wallet. ${response?.error}`,
        );
      }
      return response;
    } else {
      // --- External Wallet Path ---
      if (!this.parent) {
        console.error("KeychainWallets: Parent connection not available.");
        throw new Error("Wallet connection not ready.");
      }

      try {
        // Call the parent window's bridge method via penpal
        // Note: Parent's externalSignMessage now expects identifier string
        const response = await this.parent.externalSignMessage(
          identifier.startsWith("0x") ? getAddress(identifier) : identifier,
          message,
        );

        if (response.success && response.result) {
          // Assuming response.result is the signature string
          // Ensure it's actually a string before returning
          if (typeof response.result === "string") {
            return response;
          } else {
            console.error(
              "KeychainWallets: Parent response result is not a string:",
              response.result,
            );
            throw new Error(
              "Invalid signature format received from wallet bridge.",
            );
          }
        } else {
          const errorMsg =
            response.error || "Unknown error from external wallet bridge.";
          console.error(
            `KeychainWallets: Error from parent bridge: ${errorMsg}`,
          );
          throw new Error(errorMsg);
        }
      } catch (error) {
        console.error(
          "KeychainWallets: Failed to call externalSignMessage:",
          error,
        );
        // Re-throw the error to be caught by the WASM caller
        throw error instanceof Error ? error : new Error(String(error));
      }
    }
  }
}
