import {
  HeadlessCredentialData,
  ConnectReply,
  ConnectError,
} from "@cartridge/controller";

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
 * @param chainId - The chain ID to use
 * @returns Promise resolving to ConnectReply on success
 */
export async function authenticateHeadless(
  username: string,
  credentials: HeadlessCredentialData,
  chainId?: string,
): Promise<ConnectReply | ConnectError> {
  try {
    // TODO: Implement headless authentication flow
    // This requires:
    // 1. Fetching user's controller data from backend API
    // 2. Handling different credential types (password, webauthn, oauth, etc.)
    // 3. Creating a Controller instance with the authenticated signer
    // 4. Storing the controller in window.controller
    // 5. Returning the account address

    switch (credentials.type) {
      case "password":
        return await authenticateWithPassword(
          username,
          credentials.password,
          chainId,
        );

      case "webauthn":
        // TODO: Implement WebAuthn authentication
        return {
          code: "ERROR",
          message: "WebAuthn authentication not yet implemented",
        } as ConnectError;

      case "google":
      case "discord":
      case "metamask":
      case "rabby":
      case "phantom-evm":
        // TODO: Implement EIP-191 authentication
        return {
          code: "ERROR",
          message: `${credentials.type} authentication not yet implemented`,
        } as ConnectError;

      case "argent":
      case "braavos":
        // TODO: Implement StarkNet wallet authentication
        return {
          code: "ERROR",
          message: `${credentials.type} authentication not yet implemented`,
        } as ConnectError;

      case "siws":
        // TODO: Implement SIWS authentication
        return {
          code: "ERROR",
          message: "SIWS authentication not yet implemented",
        } as ConnectError;

      default:
        return {
          code: "ERROR",
          message: "Unknown credential type",
        } as ConnectError;
    }
  } catch (error) {
    console.error("Headless authentication failed:", error);
    return {
      code: "ERROR",
      message: error instanceof Error ? error.message : "Authentication failed",
    } as ConnectError;
  }
}

/**
 * Authenticates with password credentials
 *
 * TODO: Implement password authentication
 * Steps required:
 * 1. Fetch controller data from backend using fetchController(chainId, username)
 * 2. Extract encrypted private key from controller data
 * 3. Use decryptPrivateKey from @/components/connect/create/password/crypto to decrypt
 * 4. Create a Signer with the private key
 * 5. Create or load Controller instance with the signer
 * 6. Store in window.controller
 * 7. Return the account address
 */
async function authenticateWithPassword(
  username: string,
  password: string,
  chainId?: string,
): Promise<ConnectReply | ConnectError> {
  console.log("Attempting password authentication for:", username, chainId);
  console.log("Password provided:", !!password);

  return {
    code: "ERROR",
    message: "Password authentication requires backend API integration",
  } as ConnectError;
}

/**
 * Helper to create and store a Controller instance
 *
 * @param _username - The username
 * @param _signer - The signer to use
 * @param _address - The account address
 * @param _chainId - The chain ID
 */
// async function createAndStoreController(
//   _username: string,
//   _signer: Signer,
//   _address: string,
//   _chainId: string,
// ): Promise<Controller> {
//   // TODO: Implement controller creation and storage
//   // This should:
//   // 1. Create a new Controller instance
//   // 2. Store it in window.controller
//   // 3. Store it in indexedDB for persistence
//   // 4. Return the controller instance
//   throw new Error("Controller creation not yet implemented");
// }
