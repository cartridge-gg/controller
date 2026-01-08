/**
 * Simple Headless Mode Examples
 *
 * These examples show how to use the Controller SDK in headless mode
 * for programmatic authentication without UI.
 */

import ControllerProvider from "../src/controller";

// Example 1: Password Authentication
async function passwordExample() {
  const controller = new ControllerProvider({
    chains: [
      { rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9" },
    ],
    headless: {
      username: "alice",
      credentials: {
        type: "password",
        password: process.env.CONTROLLER_PASSWORD!,
      },
    },
  });

  const account = await controller.connect();
  console.log("Connected:", account?.address);
}

// Example 2: Google OAuth
async function googleOAuthExample() {
  const controller = new ControllerProvider({
    chains: [
      { rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9" },
    ],
    headless: {
      username: "bob",
      credentials: {
        type: "google",
        address: "0x1234567890abcdef", // From OAuth flow
      },
    },
  });

  const account = await controller.connect();
  console.log("Connected:", account?.address);
}

// Example 3: MetaMask
async function metamaskExample() {
  const controller = new ControllerProvider({
    chains: [
      { rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9" },
    ],
    headless: {
      username: "charlie",
      credentials: {
        type: "metamask",
        address: "0xabcdef1234567890",
      },
    },
  });

  const account = await controller.connect();
  console.log("Connected:", account?.address);
}

// Example 4: Argent Wallet
async function argentExample() {
  const controller = new ControllerProvider({
    chains: [
      { rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9" },
    ],
    headless: {
      username: "dave",
      credentials: {
        type: "argent",
        address:
          "0x01234567890abcdef01234567890abcdef01234567890abcdef01234567890",
      },
    },
  });

  const account = await controller.connect();
  console.log("Connected:", account?.address);
}

// Example 5: Error Handling
async function errorHandlingExample() {
  try {
    const controller = new ControllerProvider({
      chains: [
        { rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9" },
      ],
      headless: {
        username: "test-user",
        credentials: {
          type: "password",
          password: "wrong-password",
        },
      },
    });

    await controller.connect();
  } catch (error) {
    console.error("Authentication failed:", error);
    // Handle error appropriately
  }
}

// Run examples
if (require.main === module) {
  (async () => {
    console.log("=== Headless Mode Examples ===\n");

    // Uncomment to run
    // await passwordExample();
    // await googleOAuthExample();
    // await metamaskExample();
    // await argentExample();
    // await errorHandlingExample();
  })();
}

export {
  passwordExample,
  googleOAuthExample,
  metamaskExample,
  argentExample,
  errorHandlingExample,
};
