import { useState, useCallback, useEffect, useMemo } from "react";
import {
  LayerswapQuoteQuery,
  LayerswapQuoteDocument,
  LayerswapSourceNetwork,
  CreateLayerswapDepositInput,
  LayerswapQuoteQueryVariables,
  CreateLayerswapDepositMutation,
  CreateLayerswapDepositDocument,
  CreateLayerswapDepositMutationVariables,
  LayerswapStatusQuery,
  LayerswapStatusDocument,
  LayerswapStatusQueryVariables,
} from "@cartridge/ui/utils/api/cartridge";
import { request } from "@/utils/graphql";
import { useConnection } from "../connection";
import {
  ExternalPlatform,
  ExternalWalletType,
  ExternalWallet,
  ExternalWalletResponse,
} from "@cartridge/controller";
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
import { depositToLayerswapInput } from "@/utils/payments";
import { ExternalWalletError } from "@/utils/errors";

const DEPOSIT_MAX_WAIT_TIME = 10 * 60 * 1000; // 10 minutes
const DEPOSIT_POLL_INTERVAL = 3000; // 3 seconds
const SOLANA_FINALIZATION_TIMEOUT = 30000; // 30 seconds
const SOLANA_POLL_INTERVAL = 2000; // 2 seconds

export interface SendDepositResult {
  swapId: string;
  transactionHash?: string;
}

export interface Explorer {
  name: string;
  url: string;
}

export interface UseLayerswapOptions {
  selectedPlatform: ExternalPlatform | undefined;
  walletAddress: string | undefined;
  selectedWallet: ExternalWallet | undefined;
  onTransactionHash?: (hash: string) => void;
  onError?: (error: Error) => void;
}

export interface UseLayerswapReturn {
  // State
  requestedAmount: number | undefined;
  setRequestedAmount: (amount: number) => void;
  depositAmount: number | undefined; // Computed: requestedAmount + fees
  layerswapFees: string | undefined;
  isFetchingFees: boolean;
  isSendingDeposit: boolean;
  swapId: string | undefined;
  explorer: Explorer | undefined;

  // Actions
  onSendDeposit: () => Promise<void>;
  waitForDeposit: (swapId: string) => Promise<boolean>;

  // Errors
  depositError: Error | null;
  feeEstimationError: Error | null;
}

async function pollForFinalization(
  connection: Connection,
  signature: string,
  timeoutMs: number = SOLANA_FINALIZATION_TIMEOUT,
  pollIntervalMs: number = SOLANA_POLL_INTERVAL,
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

const createLayerswapDeposit = async (input: CreateLayerswapDepositInput) => {
  const result = await request<
    CreateLayerswapDepositMutation,
    CreateLayerswapDepositMutationVariables
  >(CreateLayerswapDepositDocument, {
    input,
  });

  return {
    id: result.createLayerswapDeposit.swapId,
    depositAddress: result.createLayerswapDeposit.sourceDepositAddress,
    tokenAmount: result.createLayerswapDeposit.sourceTokenAmount,
    tokenAddress: result.createLayerswapDeposit.sourceTokenAddress,
  };
};

const estimateLayerswapFees = async (input: CreateLayerswapDepositInput) => {
  const result = await request<
    LayerswapQuoteQuery,
    LayerswapQuoteQueryVariables
  >(LayerswapQuoteDocument, {
    input,
  });

  return result.layerswapQuote;
};

const waitForDeposit = async (
  swapId: string,
  isMainnet?: boolean,
): Promise<boolean> => {
  const startTime = Date.now();

  while (Date.now() - startTime < DEPOSIT_MAX_WAIT_TIME) {
    const result = await request<
      LayerswapStatusQuery,
      LayerswapStatusQueryVariables
    >(LayerswapStatusDocument, { swapId, isMainnet });

    const status = result.layerswapStatus;
    if (!status) {
      throw new Error("Swap not found");
    }

    switch (status as string) {
      case "CONFIRMED":
        return true;
      case "FAILED":
        throw new Error(`Deposit failed, swap id: ${swapId}`);
      case "EXPIRED":
        throw new Error(`Deposit expired, swap id: ${swapId}`);
      case "PENDING":
      case "PENDING_LS_TRANSFER":
      case "PENDING_USER_TRANSFER":
        await new Promise((resolve) =>
          setTimeout(resolve, DEPOSIT_POLL_INTERVAL),
        );
        break;
      default:
        await new Promise((resolve) =>
          setTimeout(resolve, DEPOSIT_POLL_INTERVAL),
        );
        break;
    }
  }

  throw new Error(
    `Deposit confirmation timed out after 10 minutes, swap id: ${swapId}`,
  );
};

const requestPhantomPayment = async (
  externalSendTransaction: (
    identifier: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txn: any,
  ) => Promise<ExternalWalletResponse>,
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

  const { blockhash } = await connection.getLatestBlockhash();

  const txn = new Transaction();
  txn.add(createAtaIx, transferInstruction);
  txn.feePayer = senderPublicKey;
  txn.recentBlockhash = blockhash;

  const serializedTxn = txn.serialize({ requireAllSignatures: false });
  const res = await externalSendTransaction(
    "phantom",
    new Uint8Array(serializedTxn),
  );
  if (!res.success) {
    throw new ExternalWalletError(res.error || "Failed to send transaction");
  }

  const { signature } = res.result as { signature: string };

  return {
    signature,
    confirmTransaction: async () => {
      await pollForFinalization(connection, signature);
    },
  };
};

const requestEvmDeposit = async (
  externalSendTransaction: (
    identifier: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txn: any,
  ) => Promise<ExternalWalletResponse>,
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
    throw new ExternalWalletError(error || "Failed to send transaction");
  }

  if (!hash || typeof hash !== "string") {
    throw new ExternalWalletError("No transaction hash received from wallet");
  }

  return hash;
};

export const getExplorer = (
  platform: ExternalPlatform,
  txHash: string,
  isMainnet?: boolean,
): Explorer | undefined => {
  if (!txHash) {
    return undefined;
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
    case "optimism":
      return {
        name: "Optimism Explorer",
        url: isMainnet
          ? `https://optimistic.etherscan.io/tx/${txHash}`
          : `https://sepolia-optimism.etherscan.io/tx/${txHash}`,
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
      return isMainnet
        ? LayerswapSourceNetwork.SolanaMainnet
        : LayerswapSourceNetwork.SolanaDevnet;
    case "ethereum":
      return isMainnet
        ? LayerswapSourceNetwork.EthereumMainnet
        : LayerswapSourceNetwork.EthereumSepolia;
    case "base":
      return isMainnet
        ? LayerswapSourceNetwork.BaseMainnet
        : LayerswapSourceNetwork.BaseSepolia;
    case "arbitrum":
      return isMainnet
        ? LayerswapSourceNetwork.ArbitrumMainnet
        : LayerswapSourceNetwork.ArbitrumSepolia;
    case "optimism":
      return isMainnet
        ? LayerswapSourceNetwork.OptimismMainnet
        : LayerswapSourceNetwork.OptimismSepolia;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

/**
 * Hook for managing Layerswap deposit/bridge functionality
 */
export function useLayerswap({
  selectedPlatform,
  walletAddress,
  selectedWallet,
  onTransactionHash,
  onError,
}: UseLayerswapOptions): UseLayerswapReturn {
  const { controller, externalSendTransaction, isMainnet } = useConnection();
  const [requestedAmount, setRequestedAmount] = useState<number | undefined>();
  const [layerswapFees, setLayerswapFees] = useState<string | undefined>();
  const [swapId, setSwapId] = useState<string | undefined>();
  const [explorer, setExplorer] = useState<Explorer | undefined>();
  const [isFetchingFees, setIsFetchingFees] = useState(false);
  const [swapInput, setSwapInput] = useState<CreateLayerswapDepositInput>();
  const [depositError, setDepositError] = useState<Error | null>(null);
  const [feeEstimationError, setFeeEstimationError] = useState<Error | null>(
    null,
  );
  const [isSendingDeposit, setIsSendingDeposit] = useState<boolean>(false);

  // Compute depositAmount = requestedAmount + fees
  const depositAmount = useMemo(() => {
    if (!requestedAmount || !layerswapFees) {
      return undefined;
    }
    return requestedAmount + Number(layerswapFees);
  }, [requestedAmount, layerswapFees]);

  const sendDeposit = useCallback(
    async (
      input: CreateLayerswapDepositInput,
      walletAddress: string,
      walletType: ExternalWalletType,
      platform: ExternalPlatform,
      onSubmitted?: (explorer: Explorer) => void,
    ): Promise<SendDepositResult> => {
      if (!controller) {
        throw new Error("Controller not connected");
      }

      try {
        setIsSendingDeposit(true);
        setDepositError(null);

        const {
          id: swapId,
          depositAddress,
          tokenAmount,
          tokenAddress,
        } = await createLayerswapDeposit(input);

        // Don't set swapId immediately to avoid premature navigation to pending screen
        // setSwapId(swapId);

        let transactionHash: string | undefined;

        switch (platform) {
          case "ethereum":
          case "arbitrum":
          case "optimism":
          case "base": {
            const hash = await requestEvmDeposit(
              externalSendTransaction,
              walletAddress,
              walletType,
              depositAddress,
              parseInt(tokenAmount),
              tokenAddress,
            );
            const explorer = getExplorer(platform, hash, isMainnet);
            if (explorer) {
              onSubmitted?.(explorer);
            }
            transactionHash = hash;
            break;
          }
          case "solana": {
            const { signature, confirmTransaction } =
              await requestPhantomPayment(
                externalSendTransaction,
                walletAddress,
                depositAddress,
                parseInt(tokenAmount),
                tokenAddress,
                isMainnet,
              );

            const explorer = getExplorer(platform, signature, isMainnet);
            if (explorer) {
              onSubmitted?.(explorer);
            }
            await confirmTransaction();
            transactionHash = signature;
            break;
          }
          default: {
            throw new Error(`Unsupported payment platform: ${platform}`);
          }
        }

        return { swapId, transactionHash };
      } catch (err) {
        setDepositError(err as Error);
        throw err;
      } finally {
        setIsSendingDeposit(false);
      }
    },
    [controller, isMainnet, externalSendTransaction],
  );

  const onSendDeposit = useCallback(async () => {
    if (!controller) throw new Error("Controller not connected");
    if (!selectedPlatform) throw new Error("No platform selected");
    if (!walletAddress) throw new Error("No wallet address");
    if (!selectedWallet?.type) throw new Error("No wallet type");
    if (!swapInput) throw new Error("Swap input not ready");
    if (!layerswapFees) throw new Error("Fees not loaded");

    try {
      const inputWithFees = { ...swapInput, layerswapFees };
      const result = await sendDeposit(
        inputWithFees,
        walletAddress,
        selectedWallet.type,
        selectedPlatform,
        (explorer) => {
          setExplorer(explorer);
        },
      );
      setSwapId(result.swapId);
      if (result.transactionHash) {
        onTransactionHash?.(result.transactionHash);
      }
    } catch (e) {
      onError?.(e as Error);
      throw e;
    }
  }, [
    controller,
    selectedPlatform,
    walletAddress,
    selectedWallet,
    swapInput,
    layerswapFees,
    sendDeposit,
    onTransactionHash,
    onError,
  ]);

  // Compute swap input for Layerswap (using requestedAmount, fees added later)
  useEffect(() => {
    if (!controller || !selectedPlatform) {
      setSwapInput(undefined);
      return;
    }

    if (selectedPlatform !== "starknet" && requestedAmount) {
      // Reset fees when requestedAmount changes so they get re-fetched
      setLayerswapFees(undefined);
      const input = depositToLayerswapInput(
        requestedAmount,
        0, // Fees will be fetched and added
        selectedPlatform,
        isMainnet,
      );
      setSwapInput(input);
    }
  }, [controller, requestedAmount, selectedPlatform, isMainnet]);

  // Auto-fetch fees when swapInput is ready
  useEffect(() => {
    if (!swapInput) return;

    let isCurrent = true;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const fetchFees = async () => {
      try {
        if (isCurrent) {
          setIsFetchingFees(true);
          setFeeEstimationError(null);
        }
        const quote = await estimateLayerswapFees(swapInput);
        if (isCurrent) {
          setLayerswapFees(quote.totalFees);
          setIsFetchingFees(false);
        }
      } catch (e) {
        if (isCurrent) {
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying fee fetch (${retryCount}/${MAX_RETRIES})...`);
            setTimeout(fetchFees, 1000 * retryCount); // Backoff
          } else {
            console.error("Fee fetch failed after retries:", e);
            setFeeEstimationError(e as Error);
            setIsFetchingFees(false);
          }
        }
      }
    };

    fetchFees();

    return () => {
      isCurrent = false;
    };
  }, [swapInput, onError]);

  const onWaitForDeposit = useCallback(
    async (swapId: string) => {
      return waitForDeposit(swapId, isMainnet);
    },
    [isMainnet],
  );

  return {
    requestedAmount,
    depositAmount,
    layerswapFees,
    isFetchingFees,
    isSendingDeposit,
    swapId,
    explorer,
    depositError,
    feeEstimationError,
    onSendDeposit,
    waitForDeposit: onWaitForDeposit,
    setRequestedAmount,
  };
}
