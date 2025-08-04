import { useState, useCallback } from "react";
import {
  CreateLayerswapPaymentDocument,
  CreateLayerswapPaymentMutation,
  LayerswapNetwork,
  CryptoPaymentQuery,
  CryptoPaymentDocument,
  LayerswapQuoteQuery,
  LayerswapQuoteDocument,
} from "@cartridge/ui/utils/api/cartridge";
import { client } from "@/utils/graphql";
import { useConnection } from "../connection";
import { ExternalPlatform, ExternalWalletType } from "@cartridge/controller";
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
import { ethers } from "ethers";
import erc20abi from "./erc20abi.json" assert { type: "json" };

export enum PurchaseType {
  CREDITS = "CREDITS",
  STARTERPACK = "STARTERPACK",
}

export interface SendPaymentResult {
  paymentId: string;
  transactionHash?: string;
}

export const useCryptoPayment = () => {
  const { controller, isMainnet, externalSendTransaction } = useConnection();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const requestPhantomPayment = useCallback(
    async (
      walletAddress: string,
      depositAddress: string,
      tokenAmount: number,
      tokenAddress: string,
      isMainnet: boolean = false,
    ) => {
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
    },
    [externalSendTransaction],
  );
  const sendPayment = useCallback(
    async (
      walletAddress: string,
      walletType: ExternalWalletType,
      platform: ExternalPlatform,
      wholeCredits: number,
      teamId?: string,
      starterpackId?: string,
      layerswapFees?: string,
      onSubmitted?: (explorer: Explorer) => void,
    ): Promise<SendPaymentResult> => {
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
          platform,
          wholeCredits,
          teamId,
          starterpackId,
          layerswapFees,
          isMainnet,
        );

        let transactionHash: string | undefined;

        switch (platform) {
          case "ethereum":
          case "arbitrum":
          case "optimism":
          case "base": {
            const hash = await requestEvmPayment(
              walletAddress,
              walletType,
              depositAddress,
              parseInt(tokenAmount),
              tokenAddress,
            );
            onSubmitted?.(getExplorer(platform, hash, isMainnet) as Explorer);
            transactionHash = hash;
            break;
          }
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
          default: {
            throw new Error(`Unsupported payment platform: ${platform}`);
          }
        }

        return { paymentId, transactionHash };
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [controller, isMainnet, requestPhantomPayment],
  );

  const quotePaymentFees = useCallback(
    async (
      username: string,
      platform: ExternalPlatform,
      wholeCredits: number,
      teamId?: string,
      starterpackId?: string,
    ) => {
      const result = await client.request<LayerswapQuoteQuery>(
        LayerswapQuoteDocument,
        {
          input: {
            username,
            credits: {
              amount: wholeCredits,
              decimals: 0,
            },
            sourceNetwork: mapPlatformToLayerswapNetwork(platform),
            purchaseType: starterpackId
              ? PurchaseType.STARTERPACK
              : PurchaseType.CREDITS,
            starterpackId,
            teamId,
            isMainnet,
          },
        },
      );

      return result.layerswapQuote;
    },
    [isMainnet],
  );

  const waitForPayment = useCallback(async (paymentId: string) => {
    const MAX_WAIT_TIME = 10 * 60 * 1000; // 10 minutes
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
          return true;
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
      `Payment confirmation timed out after 10 minutes, ref id: ${paymentId}`,
    );
  }, []);

  async function createCryptoPayment(
    username: string,
    platform: ExternalPlatform,
    wholeCredits: number,
    teamId?: string,
    starterpackId?: string,
    layerswapFees?: string,
    isMainnet: boolean = false,
  ) {
    const result = await client.request<CreateLayerswapPaymentMutation>(
      CreateLayerswapPaymentDocument,
      {
        input: {
          username,
          credits: {
            amount: wholeCredits,
            decimals: 0,
          },
          sourceNetwork: mapPlatformToLayerswapNetwork(platform),
          purchaseType: starterpackId
            ? PurchaseType.STARTERPACK
            : PurchaseType.CREDITS,
          starterpackId,
          layerswapFees,
          teamId,
          isMainnet,
        },
      },
    );

    return {
      id: result.createLayerswapPayment.cryptoPaymentId,
      depositAddress: result.createLayerswapPayment.sourceDepositAddress,
      tokenAmount: result.createLayerswapPayment.sourceTokenAmount,
      tokenAddress: result.createLayerswapPayment.sourceTokenAddress,
      swapId: result.createLayerswapPayment.swapId,
    };
  }


  async function requestEvmPayment(
    walletAddress: string,
    walletType: ExternalWalletType,
    depositAddress: string,
    tokenAmount: number,
    tokenAddress: string,
  ): Promise<string> {
    const iface = new ethers.Interface(erc20abi);
    const data = iface.encodeFunctionData("transfer", [
      depositAddress,
      tokenAmount,
    ]);

    const {
      success,
      result: hash,
      error,
    } = await externalSendTransaction(walletType, {
      from: walletAddress,
      to: tokenAddress,
      data,
      value: "0x0", // ERC-20 transfer sends no ETH
    });

    if (!success) {
      throw new Error(error);
    }

    return hash as string;
  }

  return {
    sendPayment,
    quotePaymentFees,
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
        name: "Voyager",
        url: isMainnet
          ? `https://voyager.online/tx/${txHash}`
          : `https://goerli.voyager.online/tx/${txHash}`,
      };
    case "arbitrum":
      return {
        name: "Arbitrum Explorer",
        url: isMainnet
          ? `https://arbiscan.io/tx/${txHash}`
          : `https://sepolia.arbiscan.io/tx/${txHash}`,
      };
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};

function mapPlatformToLayerswapNetwork(
  platform: ExternalPlatform,
): LayerswapNetwork {
  switch (platform) {
    case "solana":
      return LayerswapNetwork.Solana;
    case "ethereum":
      return LayerswapNetwork.Ethereum;
    case "base":
      return LayerswapNetwork.Base;
    case "arbitrum":
      return LayerswapNetwork.Arbitrum;
    case "optimism":
      return LayerswapNetwork.Optimism;
    // Starknet supported natively
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
