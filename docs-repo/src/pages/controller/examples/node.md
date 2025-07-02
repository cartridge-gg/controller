---
title: Controller Node.js Integration
description: Learn how to integrate the Cartridge Controller into your Node.js application, including setup, configuration, and usage examples.
---

# Cartridge Controller Node.js Integration

This guide demonstrates how to integrate the Cartridge Controller with a Node.js application.

## Installation

:::code-group

```bash [npm]
npm install @cartridge/controller starknet@^7.6.2 @starknet-io/types-js@^0.8.4
```

```bash [pnpm]
pnpm add @cartridge/controller starknet@^7.6.2 @starknet-io/types-js@^0.8.4
```

```bash [yarn]
yarn add @cartridge/controller starknet@^7.6.2 @starknet-io/types-js@^0.8.4
```

```bash [bun]
bun add @cartridge/controller starknet@^7.6.2 @starknet-io/types-js@^0.8.4
```

:::

> **Note**: This example requires StarkNet.js v7.6.2 or later. If you're upgrading from v6.x, see our [Migration Guide](/controller/migration-guide.md).

## Basic Setup

```typescript
import SessionProvider, {
  ControllerError,
} from "@cartridge/controller/session/node";
import { constants } from "starknet";
import path from "path";

export const STRK_CONTRACT_ADDRESS =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

async function main() {
  // Path to store session
  const storagePath =
    process.env.CARTRIDGE_STORAGE_PATH ||
    path.join(process.cwd(), ".cartridge");

  // Create a session provider
  const provider = new SessionProvider({
    rpc: "https://api.cartridge.gg/x/starknet/sepolia",
    chainId: constants.StarknetChainId.SN_SEPOLIA,
    policies: {
      contracts: {
        [STRK_CONTRACT_ADDRESS]: {
          methods: [
            {
              name: "approve",
              entrypoint: "approve",
              description: "Approve spending of tokens",
            },
            { name: "transfer", entrypoint: "transfer" },
          ],
        },
      },
    },
    basePath: storagePath,
  });

  try {
    // Connect and create session
    const account = await provider.connect();
    console.log("Session initialized!");

    if (account) {
      console.log("Account address:", account.address);

      // Example: Transfer STRK
      const amount = "0x0";
      const recipient = account.address; // Replace with actual recipient address

      const result = await account.execute([
        {
          contractAddress: STRK_CONTRACT_ADDRESS,
          entrypoint: "transfer",
          calldata: [recipient, amount, "0x0"],
        },
      ]);

      console.log("Transaction hash:", result.transaction_hash);
    } else {
      console.log("Please complete the session creation in your browser");
    }
  } catch (error: unknown) {
    const controllerError = error as ControllerError;
    if (controllerError.code) {
      console.error("Session error:", {
        code: controllerError.code,
        message: controllerError.message,
        data: controllerError.data,
      });
    } else {
      console.error("Session error:", error);
    }
  }
}

main().catch(console.error);
```

## Important Notes

1. The `basePath` parameter specifies where session data will be stored. Make sure the directory is writable.

2. When running the application for the first time, you'll need to complete the session creation in your browser. The application will provide instructions.

3. Session data is persisted between runs, so you don't need to create a new session each time.

4. The example includes proper error handling for Controller-specific errors, which include additional context through the `code` and `data` fields.

5. Keep your RPC endpoints and contract addresses secure, preferably in environment variables. 