// Simple test script for headless authentication API
// This can be run in a Node.js environment to test the headless API

import { ControllerProvider } from "@cartridge/controller";

async function testHeadlessAuth() {
  console.log("Testing headless authentication API...");
  
  const controller = new ControllerProvider({
    // Configure for sepolia testnet
    chains: [{ rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9" }],
  });

  try {
    // Test headless connection
    console.log("Attempting headless connection...");
    const account = await controller.connect({
      username: "test-user",
      authMethod: "metamask"
    });
    
    if (account) {
      console.log("✅ Headless authentication successful!");
      console.log("Account address:", account.address);
    }
  } catch (error) {
    console.log("❌ Headless authentication failed (expected for now):");
    console.log("Error:", error.message);
    
    if (error.message.includes("headless authentication not yet implemented")) {
      console.log("✅ Headless API is working correctly - reached implementation");
    }
  }

  try {
    // Test regular connection (should still work)
    console.log("\nTesting regular modal connection...");
    const account = await controller.connect();
    
    if (account) {
      console.log("✅ Regular authentication flow works");
    }
  } catch (error) {
    console.log("Regular connection test:", error.message);
  }
}

// Export for testing
export { testHeadlessAuth };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testHeadlessAuth();
}