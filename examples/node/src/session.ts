import SessionProvider, {
  type ControllerError,
} from "@cartridge/controller/session/node";
import { constants } from "starknet";
import path from "path";

const RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9";
const STRK_CONTRACT_ADDRESS =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

async function main() {
  const storagePath =
    process.env.CARTRIDGE_STORAGE_PATH ||
    path.join(process.cwd(), ".cartridge");

  const provider = new SessionProvider({
    rpc: RPC_URL,
    chainId: constants.StarknetChainId.SN_SEPOLIA,
    policies: {
      contracts: {
        [STRK_CONTRACT_ADDRESS]: {
          methods: [
            {
              name: "transfer",
              entrypoint: "transfer",
              description: "Transfer STRK",
            },
          ],
        },
      },
    },
    basePath: storagePath,
  });

  console.log("Registering a session...");
  console.log("Open the URL printed below to authorize the session.");

  const account = await provider.connect();
  if (!account) {
    console.log("Session not ready yet. Complete the browser flow and rerun.");
    return;
  }

  console.log("Session ready!");
  console.log("Account address:", account.address);

  try {
    const recipient = account.address; // Self transfer
    const amount = "0x0"; // Keep it minimal for a demo

    const result = await account.execute([
      {
        contractAddress: STRK_CONTRACT_ADDRESS,
        entrypoint: "transfer",
        calldata: [recipient, amount, "0x0"],
      },
    ]);

    console.log("Transaction hash:", result.transaction_hash);
  } catch (error: unknown) {
    const controllerError = error as ControllerError;
    if (controllerError?.code) {
      console.error("Execute error:", {
        code: controllerError.code,
        message: controllerError.message,
        data: controllerError.data,
      });
    } else {
      console.error("Execute error:", error);
    }
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exitCode = 1;
});
