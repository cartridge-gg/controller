/**
 * Headless Mode Examples
 *
 * This file demonstrates how to use the Controller SDK in headless mode
 * for programmatic authentication without displaying UI.
 *
 * WARNING: Never hardcode credentials in production code!
 * Use environment variables or secure credential storage.
 */

import Controller from "@cartridge/controller";
import { constants } from "starknet";
import type { HeadlessCredentialData } from "@cartridge/controller";

// ============================================================================
// Example 1: Password Authentication
// ============================================================================

async function examplePasswordAuth() {
  console.log("Example 1: Password Authentication");

  const controller = new Controller({
    defaultChainId: constants.StarknetChainId.SN_MAIN,
    headless: {
      username: "alice",
      credentials: {
        type: "password",
        password: process.env.USER_PASSWORD || "securePassword123!"
      }
    }
  });

  try {
    const account = await controller.connect();
    console.log("✓ Authenticated successfully!");
    console.log("  Account:", account?.address);
    return account;
  } catch (error) {
    console.error("✗ Authentication failed:", error);
    throw error;
  }
}

// ============================================================================
// Example 2: WebAuthn (Passkey) Authentication
// ============================================================================

async function exampleWebAuthnAuth() {
  console.log("\nExample 2: WebAuthn Authentication");

  // These would come from a previous registration or stored securely
  const credentialId = process.env.WEBAUTHN_CREDENTIAL_ID || "credential-id-here";
  const publicKey = process.env.WEBAUTHN_PUBLIC_KEY || "public-key-here";

  const controller = new Controller({
    defaultChainId: constants.StarknetChainId.SN_MAIN,
    headless: {
      username: "bob",
      credentials: {
        type: "webauthn",
        credentialId,
        publicKey
      }
    }
  });

  try {
    const account = await controller.connect();
    console.log("✓ Authenticated with WebAuthn!");
    console.log("  Account:", account?.address);
    return account;
  } catch (error) {
    console.error("✗ WebAuthn authentication failed:", error);
    throw error;
  }
}

// ============================================================================
// Example 3: Google OAuth Authentication
// ============================================================================

async function exampleGoogleAuth() {
  console.log("\nExample 3: Google OAuth Authentication");

  // Address from OAuth flow (EIP-191 signature)
  const address = process.env.GOOGLE_ADDRESS || "0x1234...";

  const controller = new Controller({
    defaultChainId: constants.StarknetChainId.SN_MAIN,
    headless: {
      username: "charlie",
      credentials: {
        type: "google",
        address
      }
    }
  });

  try {
    const account = await controller.connect();
    console.log("✓ Authenticated with Google!");
    console.log("  Account:", account?.address);
    return account;
  } catch (error) {
    console.error("✗ Google authentication failed:", error);
    throw error;
  }
}

// ============================================================================
// Example 4: Discord OAuth Authentication
// ============================================================================

async function exampleDiscordAuth() {
  console.log("\nExample 4: Discord OAuth Authentication");

  const address = process.env.DISCORD_ADDRESS || "0x5678...";

  const controller = new Controller({
    defaultChainId: constants.StarknetChainId.SN_MAIN,
    headless: {
      username: "dave",
      credentials: {
        type: "discord",
        address
      }
    }
  });

  try {
    const account = await controller.connect();
    console.log("✓ Authenticated with Discord!");
    console.log("  Account:", account?.address);
    return account;
  } catch (error) {
    console.error("✗ Discord authentication failed:", error);
    throw error;
  }
}

// ============================================================================
// Example 5: MetaMask Authentication
// ============================================================================

async function exampleMetaMaskAuth() {
  console.log("\nExample 5: MetaMask Authentication");

  const address = process.env.METAMASK_ADDRESS || "0x9abc...";

  const controller = new Controller({
    defaultChainId: constants.StarknetChainId.SN_MAIN,
    headless: {
      username: "eve",
      credentials: {
        type: "metamask",
        address
      }
    }
  });

  try {
    const account = await controller.connect();
    console.log("✓ Authenticated with MetaMask!");
    console.log("  Account:", account?.address);
    return account;
  } catch (error) {
    console.error("✗ MetaMask authentication failed:", error);
    throw error;
  }
}

// ============================================================================
// Example 6: Rabby Wallet Authentication
// ============================================================================

async function exampleRabbyAuth() {
  console.log("\nExample 6: Rabby Wallet Authentication");

  const address = process.env.RABBY_ADDRESS || "0xdef0...";

  const controller = new Controller({
    defaultChainId: constants.StarknetChainId.SN_MAIN,
    headless: {
      username: "frank",
      credentials: {
        type: "rabby",
        address
      }
    }
  });

  try {
    const account = await controller.connect();
    console.log("✓ Authenticated with Rabby!");
    console.log("  Account:", account?.address);
    return account;
  } catch (error) {
    console.error("✗ Rabby authentication failed:", error);
    throw error;
  }
}

// ============================================================================
// Example 7: Phantom EVM Authentication
// ============================================================================

async function examplePhantomAuth() {
  console.log("\nExample 7: Phantom EVM Authentication");

  const address = process.env.PHANTOM_ADDRESS || "0x1111...";

  const controller = new Controller({
    defaultChainId: constants.StarknetChainId.SN_MAIN,
    headless: {
      username: "grace",
      credentials: {
        type: "phantom-evm",
        address
      }
    }
  });

  try {
    const account = await controller.connect();
    console.log("✓ Authenticated with Phantom EVM!");
    console.log("  Account:", account?.address);
    return account;
  } catch (error) {
    console.error("✗ Phantom authentication failed:", error);
    throw error;
  }
}

// ============================================================================
// Example 8: Argent Wallet Authentication
// ============================================================================

async function exampleArgentAuth() {
  console.log("\nExample 8: Argent Wallet Authentication");

  const address = process.env.ARGENT_ADDRESS || "0x2222...";

  const controller = new Controller({
    defaultChainId: constants.StarknetChainId.SN_MAIN,
    headless: {
      username: "hank",
      credentials: {
        type: "argent",
        address
      }
    }
  });

  try {
    const account = await controller.connect();
    console.log("✓ Authenticated with Argent!");
    console.log("  Account:", account?.address);
    return account;
  } catch (error) {
    console.error("✗ Argent authentication failed:", error);
    throw error;
  }
}

// ============================================================================
// Example 9: Braavos Wallet Authentication
// ============================================================================

async function exampleBraavosAuth() {
  console.log("\nExample 9: Braavos Wallet Authentication");

  const address = process.env.BRAAVOS_ADDRESS || "0x3333...";

  const controller = new Controller({
    defaultChainId: constants.StarknetChainId.SN_MAIN,
    headless: {
      username: "iris",
      credentials: {
        type: "braavos",
        address
      }
    }
  });

  try {
    const account = await controller.connect();
    console.log("✓ Authenticated with Braavos!");
    console.log("  Account:", account?.address);
    return account;
  } catch (error) {
    console.error("✗ Braavos authentication failed:", error);
    throw error;
  }
}

// ============================================================================
// Example 10: SIWS (Sign-In With StarkNet) Authentication
// ============================================================================

async function exampleSIWSAuth() {
  console.log("\nExample 10: SIWS Authentication");

  const address = process.env.SIWS_ADDRESS || "0x4444...";
  const signature = process.env.SIWS_SIGNATURE || "signature-from-wallet";

  const controller = new Controller({
    defaultChainId: constants.StarknetChainId.SN_MAIN,
    headless: {
      username: "jack",
      credentials: {
        type: "siws",
        address,
        signature
      }
    }
  });

  try {
    const account = await controller.connect();
    console.log("✓ Authenticated with SIWS!");
    console.log("  Account:", account?.address);
    return account;
  } catch (error) {
    console.error("✗ SIWS authentication failed:", error);
    throw error;
  }
}

// ============================================================================
// Example 11: Type-Safe Credential Building
// ============================================================================

function buildCredentials(type: string, data: any): HeadlessCredentialData {
  // TypeScript ensures we return valid credential structure
  switch (type) {
    case "password":
      return {
        type: "password",
        password: data.password
      };

    case "webauthn":
      return {
        type: "webauthn",
        credentialId: data.credentialId,
        publicKey: data.publicKey
      };

    case "google":
    case "discord":
    case "metamask":
    case "rabby":
    case "phantom-evm":
      return {
        type: type as any,
        address: data.address
      };

    case "argent":
    case "braavos":
      return {
        type: type as any,
        address: data.address
      };

    case "siws":
      return {
        type: "siws",
        address: data.address,
        signature: data.signature
      };

    default:
      throw new Error(`Unknown credential type: ${type}`);
  }
}

// ============================================================================
// Example 12: Error Handling
// ============================================================================

async function exampleWithErrorHandling() {
  console.log("\nExample 12: Error Handling");

  const controller = new Controller({
    defaultChainId: constants.StarknetChainId.SN_MAIN,
    headless: {
      username: "testuser",
      credentials: {
        type: "password",
        password: "testpassword"
      }
    }
  });

  try {
    const account = await controller.connect();

    if (!account) {
      throw new Error("Authentication failed - no account returned");
    }

    console.log("✓ Authentication successful!");
    console.log("  Address:", account.address);

    // Now you can use the account
    // const result = await account.execute([...calls]);

  } catch (error: any) {
    // Handle specific error types
    if (error.name === "InvalidCredentialsError") {
      console.error("✗ Invalid credentials provided");
    } else if (error.name === "HeadlessAuthenticationError") {
      console.error("✗ Authentication error:", error.message);
      if (error.cause) {
        console.error("  Caused by:", error.cause);
      }
    } else {
      console.error("✗ Unexpected error:", error.message);
    }

    // Log for debugging (but never log credentials!)
    console.error("  Error type:", error.name);
    console.error("  Error stack:", error.stack);

    throw error;
  }
}

// ============================================================================
// Example 13: Server-Side Authentication Service
// ============================================================================

class AuthenticationService {
  private controllers: Map<string, Controller> = new Map();

  async authenticate(
    username: string,
    credentials: HeadlessCredentialData
  ): Promise<string> {
    console.log(`\nAuthenticating user: ${username}`);

    // Check if already authenticated
    const existingController = this.controllers.get(username);
    if (existingController) {
      console.log("  Using existing session");
      // Return the account address, not the username
      return existingController.address;
    }

    // Create new controller with headless mode
    const controller = new Controller({
      defaultChainId: constants.StarknetChainId.SN_MAIN,
      headless: {
        username,
        credentials
      }
    });

    try {
      const account = await controller.connect();

      if (!account) {
        throw new Error("Authentication failed");
      }

      // Store controller for reuse
      this.controllers.set(username, controller);

      console.log("✓ User authenticated successfully");
      console.log("  Account:", account.address);

      return account.address;
    } catch (error) {
      console.error("✗ Authentication failed for user:", username);
      throw error;
    }
  }

  async getController(username: string): Promise<Controller | undefined> {
    return this.controllers.get(username);
  }

  async logout(username: string): Promise<void> {
    const controller = this.controllers.get(username);
    if (controller) {
      await controller.disconnect();
      this.controllers.delete(username);
      console.log(`✓ User ${username} logged out`);
    }
  }
}

// ============================================================================
// Example 14: Environment Variable Configuration
// ============================================================================

async function exampleFromEnvironment() {
  console.log("\nExample 14: Authentication from Environment Variables");

  // Load from environment
  const username = process.env.CARTRIDGE_USERNAME;
  const password = process.env.CARTRIDGE_PASSWORD;

  if (!username || !password) {
    throw new Error("Missing required environment variables: CARTRIDGE_USERNAME, CARTRIDGE_PASSWORD");
  }

  const controller = new Controller({
    defaultChainId: constants.StarknetChainId.SN_MAIN,
    headless: {
      username,
      credentials: {
        type: "password",
        password
      }
    }
  });

  const account = await controller.connect();
  console.log("✓ Authenticated from environment variables");
  console.log("  Account:", account?.address);

  return account;
}

// ============================================================================
// Main function to run examples
// ============================================================================

async function main() {
  console.log("=".repeat(80));
  console.log("Cartridge Controller - Headless Mode Examples");
  console.log("=".repeat(80));

  // Run a simple example (password auth)
  // Comment out to test other examples
  try {
    await examplePasswordAuth();
  } catch (error) {
    console.error("Example failed:", error);
  }

  // Uncomment to run other examples:
  // await exampleWebAuthnAuth();
  // await exampleGoogleAuth();
  // await exampleDiscordAuth();
  // await exampleMetaMaskAuth();
  // await exampleRabbyAuth();
  // await examplePhantomAuth();
  // await exampleArgentAuth();
  // await exampleBraavosAuth();
  // await exampleSIWSAuth();
  // await exampleWithErrorHandling();
  // await exampleFromEnvironment();

  // Example: Authentication service
  // const authService = new AuthenticationService();
  // await authService.authenticate("alice", {
  //   type: "password",
  //   password: "secret123"
  // });

  console.log("\n" + "=".repeat(80));
  console.log("Examples complete!");
  console.log("=".repeat(80));
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

// Export examples for use in other files
export {
  examplePasswordAuth,
  exampleWebAuthnAuth,
  exampleGoogleAuth,
  exampleDiscordAuth,
  exampleMetaMaskAuth,
  exampleRabbyAuth,
  examplePhantomAuth,
  exampleArgentAuth,
  exampleBraavosAuth,
  exampleSIWSAuth,
  exampleWithErrorHandling,
  exampleFromEnvironment,
  buildCredentials,
  AuthenticationService
};
