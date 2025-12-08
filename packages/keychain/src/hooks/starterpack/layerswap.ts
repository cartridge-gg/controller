import { useState, useCallback, useEffect } from "react";
import { ExternalPlatform, ExternalWallet } from "@cartridge/controller";
import { Explorer, useLayerswapDeposit } from "@/hooks/payments/crypto";
import { depositToLayerswapInput } from "@/utils/payments";
import { CreateLayerswapDepositInput } from "@cartridge/ui/utils/api/cartridge";
import Controller from "@/utils/controller";

export interface UseLayerswapOptions {
  controller: Controller | undefined;
  isMainnet: boolean;
  selectedPlatform: ExternalPlatform | undefined;
  walletAddress: string | undefined;
  selectedWallet: ExternalWallet | undefined;
  onTransactionHash?: (hash: string) => void;
  onError?: (error: Error) => void;
}

export interface UseLayerswapReturn {
  // State
  depositAmount: number | undefined;
  setDepositAmount: (amount: number) => void;
  layerswapFees: string | undefined;
  isFetchingFees: boolean;
  swapId: string | undefined;
  explorer: Explorer | undefined;

  // Actions
  onBackendCryptoPurchase: () => Promise<void>;
  waitForDeposit: (swapId: string) => Promise<boolean>;
  fetchFees: () => Promise<void>;

  // Errors
  depositError: Error | null;
}

/**
 * Hook for managing Layerswap deposit/bridge functionality
 * Note: This is kept for future use but currently disabled in the UI
 */
export function useLayerswap({
  controller,
  isMainnet,
  selectedPlatform,
  walletAddress,
  selectedWallet,
  onTransactionHash,
  onError,
}: UseLayerswapOptions): UseLayerswapReturn {
  const [depositAmount, setDepositAmount] = useState<number | undefined>();
  const [layerswapFees, setLayerswapFees] = useState<string | undefined>();
  const [swapId, setSwapId] = useState<string | undefined>();
  const [explorer, setExplorer] = useState<Explorer | undefined>();
  const [isFetchingFees, setIsFetchingFees] = useState(false);
  const [swapInput, setSwapInput] = useState<CreateLayerswapDepositInput>();

  const {
    error: depositError,
    sendDeposit,
    estimateLayerswapFees,
    waitForDeposit,
  } = useLayerswapDeposit();

  // Compute swap input for Layerswap
  useEffect(() => {
    const getSwapInput = () => {
      if (!controller || !selectedPlatform) {
        setSwapInput(undefined);
        return;
      }

      if (selectedPlatform !== "starknet" && depositAmount) {
        const input = depositToLayerswapInput(
          depositAmount,
          Number(layerswapFees || 0),
          controller.username(),
          selectedPlatform,
          isMainnet,
        );
        setSwapInput(input);
      }
    };
    getSwapInput();
  }, [controller, depositAmount, layerswapFees, selectedPlatform, isMainnet]);

  const onBackendCryptoPurchase = useCallback(async () => {
    if (
      !controller ||
      !selectedPlatform ||
      !walletAddress ||
      !selectedWallet?.type ||
      !layerswapFees ||
      !swapInput
    )
      return;

    try {
      swapInput.layerswapFees = layerswapFees;

      const result = await sendDeposit(
        swapInput,
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

  const fetchFees = useCallback(async () => {
    if (!swapInput) return;

    try {
      setIsFetchingFees(true);

      const quote = await estimateLayerswapFees(swapInput);
      setLayerswapFees(quote.totalFees);
    } catch (e) {
      onError?.(e as Error);
      throw e;
    } finally {
      setIsFetchingFees(false);
    }
  }, [swapInput, estimateLayerswapFees, onError]);

  return {
    depositAmount,
    setDepositAmount,
    layerswapFees,
    isFetchingFees,
    swapId,
    explorer,
    onBackendCryptoPurchase,
    waitForDeposit,
    fetchFees,
    depositError,
  };
}
