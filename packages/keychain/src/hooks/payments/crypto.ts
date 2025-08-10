import { useState, useCallback, useMemo } from "react";
import {
  CreateCryptoPaymentDocument,
  CreateCryptoPaymentMutation,
  Network,
  CryptoPaymentQuery,
  CryptoPaymentDocument,
} from "@cartridge/ui/utils/api/cartridge";
import { client } from "@/utils/graphql";
import { useConnection } from "../connection";
import { ExternalPlatform } from "@cartridge/controller";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { constants } from "starknet";

export enum PurchaseType {
  CREDITS = "CREDITS",
  STARTERPACK = "STARTERPACK",
}

export const useCryptoPayment = () => {
  const { controller, externalSendTransaction } = useConnection();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const isMainnet = useMemo(() => {
    if (
      import.meta.env.PROD &&
      controller?.chainId() === constants.StarknetChainId.SN_MAIN
    ) {
      return true;
    }

    return false;
  }, [controller]);

  const sendPayment = useCallback(
    async (
      walletAddress: string,
      wholeCredits: number,
      platform: ExternalPlatform,
      teamId?: string,
      starterpackId?: string,
      onSubmitted?: (explorer: Explorer) => void,
    ): Promise<string> => {
      if (!controller) {
        throw new Error("Controller not connected");
      }

      try {
        setIsLoading(true);
        setError(null);

        const {
          id: paymentId,
          depositAddress,
          tokenAmount,
          tokenAddress,
        } = await createCryptoPayment(
          controller.username(),
          wholeCredits,
          platform,
          teamId,
          starterpackId,
          isMainnet,
        );

        switch (platform) {
          case "solana": {
            const { signature, confirmTransaction } =
              await requestPhantomPayment(
                walletAddress,
                depositAddress,
                parseInt(tokenAmount),
                tokenAddress,
                isMainnet,
              );

            onSubmitted?.(
              getExplorer(platform, signature, isMainnet) as Explorer,
            );
            await confirmTransaction();
            break;
          }
          case "ethereum": {
            throw new Error("Ethereum not supported yet");
          }
          case "starknet": {
            throw new Error("Starknet not supported yet");
          }
        }

        return paymentId;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [controller, externalSendTransaction, isMainnet],
  );

  const waitForPayment = useCallback(async (paymentId: string) => {
    const MAX_WAIT_TIME = 60 * 1000; // 1 minute
    const POLL_INTERVAL = 3000; // 3 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < MAX_WAIT_TIME) {
      const result = await client.request<CryptoPaymentQuery>(
        CryptoPaymentDocument,
        {
          id: paymentId,
        },
      );

      const payment = result.cryptoPayment;
      if (!payment) {
        throw new Error("Payment not found");
      }

      switch (payment.status) {
        case "CONFIRMED":
          return payment;
        case "FAILED":
          throw new Error(`Payment failed, ref id: ${paymentId}`);
        case "EXPIRED":
          throw new Error(`Payment expired, ref id: ${paymentId}`);
        case "PENDING":
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
          break;
      }
    }

    throw new Error(
      `Payment confirmation timed out after 1 minute, ref id: ${paymentId}`,
    );
  }, []);

  async function createCryptoPayment(
    username: string,
    wholeCredits: number,
    platform: ExternalPlatform,
    teamId?: string,
    starterpackId?: string,
    isMainnet: boolean = false,
  ) {
    const result = await client.request<CreateCryptoPaymentMutation>(
      CreateCryptoPaymentDocument,
      {
        input: {
          username,
          credits: {
            amount: wholeCredits,
            decimals: 0,
          },
          network: platform.toUpperCase() as Network,
          purchaseType: starterpackId
            ? PurchaseType.STARTERPACK
            : PurchaseType.CREDITS,
          starterpackId,
          teamId,
          isMainnet,
        },
      },
    );

    return result.createCryptoPayment;
  }

  async function requestPhantomPayment(
    walletAddress: string,
    depositAddress: string,
    tokenAmount: number,
    tokenAddress: string,
    isMainnet: boolean = false,
  ) {
    const rpcUrl = isMainnet
      ? import.meta.env.VITE_SOLANA_MAINNET_RPC_URL ||
        clusterApiUrl("mainnet-beta")
      : import.meta.env.VITE_SOLANA_DEVNET_RPC_URL || clusterApiUrl("devnet");
    const connection = new Connection(rpcUrl);
    const senderPublicKey = new PublicKey(walletAddress);
    const recipientPublicKey = new PublicKey(depositAddress);
    const tokenMint = new PublicKey(tokenAddress);

    const senderTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      senderPublicKey,
    );

    const recipientTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      recipientPublicKey,
    );

    const createAtaIx = createAssociatedTokenAccountInstruction(
      senderPublicKey,
      recipientTokenAccount,
      recipientPublicKey,
      tokenMint,
    );

    const transferInstruction = createTransferInstruction(
      senderTokenAccount,
      recipientTokenAccount,
      new PublicKey(walletAddress),
      tokenAmount,
    );

    const txn = new Transaction().add(createAtaIx, transferInstruction);
    txn.feePayer = senderPublicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    txn.recentBlockhash = blockhash;

    const serializedTxn = txn.serialize({ requireAllSignatures: false });
    const res = await externalSendTransaction(
      "phantom",
      new Uint8Array(serializedTxn),
    );
    if (!res.success) {
      throw new Error(res.error);
    }

    const { signature } = res.result as { signature: string };

    return {
      signature,
      confirmTransaction: async () => {
        await pollForFinalization(connection, signature);
      },
    };
  }

  return {
    sendPayment,
    waitForPayment,
    isLoading,
    error,
  };
};

async function pollForFinalization(
  connection: Connection,
  signature: string,
  timeoutMs: number = 30000,
  pollIntervalMs: number = 2000,
): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const status = await connection.getSignatureStatus(signature);
    const value = status?.value;

    if (value?.confirmationStatus === "finalized") {
      return;
    }

    if (value?.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(value.err)}`);
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error("Transaction confirmation timed out");
}

export interface Explorer {
  name: string;
  url: string;
}

const getExplorer = (
  platform: ExternalPlatform,
  txHash: string,
  isMainnet?: boolean,
): Explorer => {
  if (!txHash) {
    throw new Error("Transaction hash is required");
  }

  switch (platform) {
    case "solana":
      return {
        name: "Solana Explorer",
        url: `https://explorer.solana.com/tx/${txHash}${isMainnet ? "" : "?cluster=devnet"}`,
      };
    case "ethereum":
      return {
        name: "Etherscan",
        url: isMainnet
          ? `https://etherscan.io/tx/${txHash}`
          : `https://sepolia.etherscan.io/tx/${txHash}`,
      };
    case "starknet":
      return {
        name: "Cartridge Explorer",
        url: isMainnet
          ? `https://explorer.cartridge.gg/tx/${txHash}`
          : `https://starknet-sepolia.explorer.cartridge.gg/tx/${txHash}`,
      };
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};
