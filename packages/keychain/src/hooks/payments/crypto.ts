import { useState, useCallback } from "react";
import {
  CreateCryptoPaymentDocument,
  CreateCryptoPaymentMutation,
  Network,
  CryptoPaymentQuery,
  CryptoPaymentDocument,
} from "@cartridge/utils/api/cartridge";
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
import { StarterPackDetails } from "../starterpack";

export enum PurchaseType {
  CREDITS = "CREDITS",
  STARTERPACK = "STARTERPACK",
}

export const useCryptoPayment = () => {
  const { controller, externalSendTransaction } = useConnection();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const sendPayment = useCallback(
    async (
      walletAddress: string,
      credits: number,
      platform: ExternalPlatform,
      starterpack?: StarterPackDetails,
      isMainnet: boolean = false,
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
          credits,
          platform,
          starterpack,
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
    [controller, externalSendTransaction],
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
    credits: number,
    platform: ExternalPlatform,
    starterpack?: StarterPackDetails,
    isMainnet: boolean = false,
  ) {
    const result = await client.request<CreateCryptoPaymentMutation>(
      CreateCryptoPaymentDocument,
      {
        input: {
          username,
          credits,
          network: platform.toUpperCase() as Network,
          purchaseType: starterpack
            ? PurchaseType.STARTERPACK
            : PurchaseType.CREDITS,
          starterpackId: starterpack?.id,
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
    const connection = new Connection(
      isMainnet ? clusterApiUrl("mainnet-beta") : clusterApiUrl("devnet"),
    );
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
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    txn.recentBlockhash = blockhash;

    const serializedTxn = txn
      .serialize({ requireAllSignatures: false })
      .toString("base64");
    const res = await externalSendTransaction("phantom", serializedTxn);
    if (!res.success) {
      throw new Error(res.error);
    }

    const { signature } = res.result as { signature: string };

    return {
      signature,
      confirmTransaction: async () => {
        await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        });
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
        name: "Voyager",
        url: isMainnet
          ? `https://voyager.online/tx/${txHash}`
          : `https://goerli.voyager.online/tx/${txHash}`,
      };
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};
