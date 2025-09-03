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
    rpc: "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9",
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

      // Example: Transfer ETH
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
