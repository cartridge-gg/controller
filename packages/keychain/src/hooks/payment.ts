import { useState, useCallback } from "react";
import {
  CreateCryptoPaymentDocument,
  CreateCryptoPaymentMutation,
  Chain,
} from "@cartridge/utils/api/cartridge";
import { client } from "@/utils/graphql";
import { useConnection } from "./connection";
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

const PLATFORM_TO_CHAIN: Record<ExternalPlatform, Chain> = {
  ethereum: Chain.Ethereum,
  solana: Chain.Solana,
  starknet: Chain.Starknet,
};

const useCryptoPayment = () => {
  const { controller, externalSendTransaction } = useConnection();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const sendPayment = useCallback(
    async (
      walletAddress: string,
      credits: number,
      platform: ExternalPlatform,
      isMainnet: boolean = false,
      onSubmitted?: (explorer: Explorer) => void,
    ) => {
      if (!controller) {
        throw new Error("Controller not connected");
      }

      try {
        setIsLoading(true);
        setError(null);

        const { depositAddress, tokenAmount, tokenAddress } =
          await createCryptoPayment(
            controller.username(),
            credits,
            platform,
            isMainnet,
          );

        switch (platform) {
          case "solana": {
            const { signature, confirmTransaction } =
              await requestPhantomPayment(
                walletAddress,
                depositAddress,
                tokenAmount,
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
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [controller, externalSendTransaction],
  );

  async function createCryptoPayment(
    username: string,
    credits: number,
    platform: ExternalPlatform,
    isMainnet: boolean = false,
  ) {
    const result = await client.request<CreateCryptoPaymentMutation>(
      CreateCryptoPaymentDocument,
      {
        input: {
          username,
          credits,
          chain: PLATFORM_TO_CHAIN[platform],
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

export default useCryptoPayment;
