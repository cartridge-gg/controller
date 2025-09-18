import { useState, useCallback } from "react";
import {
  CreateLayerswapPaymentDocument,
  CreateLayerswapPaymentMutation,
  CryptoPaymentQuery,
  CryptoPaymentDocument,
  LayerswapQuoteQuery,
  LayerswapQuoteDocument,
  LayerswapSourceNetwork,
  CreateLayerswapPaymentInput,
  LayerswapQuoteQueryVariables,
  CreateLayerswapPaymentMutationVariables,
} from "@cartridge/ui/utils/api/cartridge";
import { request } from "@/utils/graphql";
import { useConnection } from "../connection";
import { ExternalPlatform, ExternalWalletType } from "@cartridge/controller";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "../../utils/solana";
import { ethers } from "ethers";
import erc20abi from "./erc20abi.json" assert { type: "json" };

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

      // Build transaction using micro-sol-signer
      const { blockhash } = await connection.getLatestBlockhash();

      // Create a new transaction and add instructions
      const txn = new Transaction();
      txn.add(createAtaIx, transferInstruction);
      txn.feePayer = senderPublicKey;
      txn.recentBlockhash = blockhash;

      // Serialize for sending
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

  const requestEvmPayment = useCallback(
    async (
      walletAddress: string,
      walletType: ExternalWalletType,
      depositAddress: string,
      tokenAmount: number,
      tokenAddress: string,
    ): Promise<string> => {
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
    },
    [externalSendTransaction],
  );

  const sendPayment = useCallback(
    async (
      input: CreateLayerswapPaymentInput,
      walletAddress: string,
      walletType: ExternalWalletType,
      platform: ExternalPlatform,
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
        } = await createCryptoPayment(input);

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
    [controller, isMainnet, requestPhantomPayment, requestEvmPayment],
  );

  const estimateStarterPackFees = useCallback(
    async (input: CreateLayerswapPaymentInput) => {
      const result = await request<
        LayerswapQuoteQuery,
        LayerswapQuoteQueryVariables
      >(LayerswapQuoteDocument, {
        input: input,
      });

      return result.layerswapQuote;
    },
    [],
  );

  const waitForPayment = useCallback(async (paymentId: string) => {
    const MAX_WAIT_TIME = 10 * 60 * 1000; // 10 minutes
    const POLL_INTERVAL = 3000; // 3 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < MAX_WAIT_TIME) {
      const result = await request<CryptoPaymentQuery>(CryptoPaymentDocument, {
        id: paymentId,
      });

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

  async function createCryptoPayment(input: CreateLayerswapPaymentInput) {
    const result = await request<CreateLayerswapPaymentMutation>(
      CreateLayerswapPaymentDocument,
      {
        input,
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

  async function createStarterPackPayment(input: CreateLayerswapPaymentInput) {
    const result = await request<
      CreateLayerswapPaymentMutation,
      CreateLayerswapPaymentMutationVariables
    >(CreateLayerswapPaymentDocument, {
      input,
    });

    return {
      id: result.createLayerswapPayment.cryptoPaymentId,
      depositAddress: result.createLayerswapPayment.sourceDepositAddress,
      tokenAmount: result.createLayerswapPayment.sourceTokenAmount,
      tokenAddress: result.createLayerswapPayment.sourceTokenAddress,
      swapId: result.createLayerswapPayment.swapId,
    };
  }

  return {
    sendPayment,
    estimateStarterPackFees,
    waitForPayment,
    createStarterPackPayment,
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

export const getExplorer = (
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
    case "arbitrum":
      return {
        name: "Arbitrum Explorer",
        url: isMainnet
          ? `https://arbiscan.io/tx/${txHash}`
          : `https://sepolia.arbiscan.io/tx/${txHash}`,
      };
    case "base":
      return {
        name: "Base Explorer",
        url: isMainnet
          ? `https://basescan.org/tx/${txHash}`
          : `https://sepolia.basescan.org/tx/${txHash}`,
      };
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};

export function mapPlatformToLayerswapSourceNetwork(
  platform: ExternalPlatform,
  isMainnet: boolean,
): LayerswapSourceNetwork {
  switch (platform) {
    case "solana":
      if (isMainnet) {
        return LayerswapSourceNetwork.SolanaMainnet;
      } else {
        return LayerswapSourceNetwork.SolanaDevnet;
      }
    case "ethereum":
      if (isMainnet) {
        return LayerswapSourceNetwork.EthereumMainnet;
      } else {
        return LayerswapSourceNetwork.EthereumSepolia;
      }
    case "base":
      if (isMainnet) {
        return LayerswapSourceNetwork.BaseMainnet;
      } else {
        return LayerswapSourceNetwork.BaseSepolia;
      }
    case "arbitrum":
      if (isMainnet) {
        return LayerswapSourceNetwork.ArbitrumMainnet;
      } else {
        return LayerswapSourceNetwork.ArbitrumSepolia;
      }
    case "optimism":
      if (isMainnet) {
        return LayerswapSourceNetwork.OptimismMainnet;
      } else {
        return LayerswapSourceNetwork.OptimismSepolia;
      }
    // Starknet supported natively
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
