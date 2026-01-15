import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { ExternalPlatform, ExternalWallet } from "@cartridge/controller";
import { useConnection } from "@/hooks/connection";
import { usdcToUsd } from "@/utils/starterpack";
import { uint256, Call, num, cairo } from "starknet";
import { isOnchainStarterpack } from "./types";
import { getCurrentReferral } from "@/utils/referral";
import { prepareSwapCalls, type SwapQuote } from "@/utils/ekubo";
import { Item } from "./types";
import { useStarterpackContext } from "./starterpack";
import { ExternalWalletError } from "@/utils/errors";
import {
  useQuantity,
  useExternalWallet,
  useLayerswap,
  useTokenSelection,
  type TokenOption,
} from "@/hooks/starterpack";
import { Explorer } from "@/hooks/starterpack/layerswap";

export type { TokenOption } from "@/hooks/starterpack";

export interface OnchainPurchaseContextType {
  // Purchase items
  purchaseItems: Item[];

  // Quantity management
  quantity: number;
  incrementQuantity: () => void;
  decrementQuantity: () => void;

  // Wallet state
  selectedWallet: ExternalWallet | undefined;
  selectedPlatform: ExternalPlatform | undefined;
  walletAddress: string | undefined;
  clearSelectedWallet: () => void;

  // Token selection
  availableTokens: TokenOption[];
  selectedToken: TokenOption | undefined;
  setSelectedToken: (token: TokenOption | undefined) => void;
  convertedPrice: {
    amount: bigint;
    tokenMetadata: { symbol: string; decimals: number };
  } | null;
  swapQuote: SwapQuote | null;
  isFetchingConversion: boolean;
  isTokenSelectionLocked: boolean;
  conversionError: Error | null;

  // USD amount (derived from quote)
  usdAmount: number;

  // Layerswap state (for future use)
  layerswapFees: string | undefined;
  isFetchingFees: boolean;
  isSendingDeposit: boolean;
  swapId: string | undefined;
  explorer: Explorer | undefined;
  requestedAmount: number | undefined;
  depositAmount: number | undefined; // Computed: requestedAmount + fees
  setRequestedAmount: (amount: number) => void;
  feeEstimationError: Error | null;

  // Actions
  onOnchainPurchase: () => Promise<void>;
  onExternalConnect: (
    wallet: ExternalWallet,
    platform: ExternalPlatform,
    chainId?: string,
  ) => Promise<string | undefined>;
  onSendDeposit: () => Promise<void>;
  waitForDeposit: (swapId: string) => Promise<boolean>;
}

export const OnchainPurchaseContext = createContext<
  OnchainPurchaseContextType | undefined
>(undefined);

export interface OnchainPurchaseProviderProps {
  children: ReactNode;
}

export const OnchainPurchaseProvider = ({
  children,
}: OnchainPurchaseProviderProps) => {
  const { controller, isMainnet, origin, externalSendTransaction } =
    useConnection();
  const {
    starterpackId,
    starterpackDetails,
    setTransactionHash,
    setDisplayError,
  } = useStarterpackContext();

  // Purchase items and USD amount
  const [purchaseItems, setPurchaseItems] = useState<Item[]>([]);
  const [usdAmount, setUsdAmount] = useState(0);

  // Compose hooks
  const { quantity, incrementQuantity, decrementQuantity, resetQuantity } =
    useQuantity();

  const {
    selectedWallet,
    selectedPlatform,
    walletAddress,
    onExternalConnect,
    clearSelectedWallet,
    walletError,
  } = useExternalWallet({
    controller,
    onError: setDisplayError,
  });

  // Get onchain starterpack details if available
  const onchainDetails =
    starterpackDetails && isOnchainStarterpack(starterpackDetails)
      ? starterpackDetails
      : undefined;

  const {
    availableTokens,
    selectedToken,
    setSelectedToken,
    convertedPrice,
    swapQuote,
    isFetchingConversion,
    conversionError,
    isTokenSelectionLocked,
    resetTokenSelection,
  } = useTokenSelection({
    controller,
    starterpackDetails: onchainDetails,
    quantity,
    selectedPlatform,
  });

  const {
    requestedAmount,
    setRequestedAmount,
    depositAmount,
    layerswapFees,
    isFetchingFees,
    isSendingDeposit,
    swapId,
    explorer,
    depositError,
    feeEstimationError,
    onSendDeposit: onSendDepositInternal,
    waitForDeposit,
  } = useLayerswap({
    controller,
    isMainnet,
    selectedPlatform,
    walletAddress,
    selectedWallet,
    onTransactionHash: setTransactionHash,
    onError: setDisplayError,
  });

  // Reset state when starterpack changes
  useEffect(() => {
    resetTokenSelection();
    resetQuantity();
    setPurchaseItems([]);
  }, [starterpackId, resetTokenSelection, resetQuantity]);

  // Update purchase items and USD amount when starterpack details change
  useEffect(() => {
    if (starterpackDetails && isOnchainStarterpack(starterpackDetails)) {
      setPurchaseItems(starterpackDetails.items);
      const totalUsd = starterpackDetails.quote
        ? usdcToUsd(starterpackDetails.quote.totalCost)
        : 0;
      setUsdAmount(totalUsd);
    }
  }, [starterpackDetails]);

  // Sync errors from hooks
  useEffect(() => {
    if (walletError) {
      setDisplayError(walletError);
    }
    if (depositError) {
      setDisplayError(depositError);
    }
    if (feeEstimationError) {
      setDisplayError(feeEstimationError);
    }
  }, [walletError, depositError, feeEstimationError, setDisplayError]);

  // Clear errors when token or wallet selection changes
  useEffect(() => {
    setDisplayError(undefined);
  }, [selectedToken, selectedWallet, setDisplayError]);

  // Wrap onSendDeposit to clear errors before sending
  const onSendDeposit = useCallback(async () => {
    setDisplayError(undefined);
    try {
      await onSendDepositInternal();
    } catch (error) {
      setDisplayError(error as Error);
      throw error;
    }
  }, [onSendDepositInternal, setDisplayError]);

  // When network is not starknet, retrieve layerswap deposit amount
  useEffect(() => {
    if (
      !selectedPlatform ||
      selectedPlatform === "starknet" ||
      !convertedPrice
    ) {
      return;
    }

    setRequestedAmount(Number(convertedPrice.amount));
  }, [selectedPlatform, convertedPrice, setRequestedAmount]);

  const onOnchainPurchase = useCallback(async () => {
    if (!controller || !starterpackDetails) return;

    if (!isOnchainStarterpack(starterpackDetails)) {
      throw new Error("Not an onchain starterpack");
    }

    const { quote, id: packId } = starterpackDetails;

    if (!quote) {
      throw new Error("Quote not loaded yet");
    }

    try {
      const registryContract = import.meta.env
        .VITE_STARTERPACK_REGISTRY_CONTRACT;
      const recipient = controller.address();

      const walletType =
        selectedWallet?.type === "argent" || selectedWallet?.type === "braavos"
          ? selectedWallet.type
          : "controller";

      const needsSwap =
        selectedToken &&
        num.toHex(selectedToken.address) !== num.toHex(quote.paymentToken);

      const totalCostWithQuantity = quote.totalCost * BigInt(quantity);

      let allCalls: Call[] = [];

      // Add swap calls if needed
      if (needsSwap && selectedToken) {
        if (!swapQuote) {
          throw new Error("No swap quote found");
        }

        // Note: swapQuote is already fetched with quantity applied in useTokenSelection,
        // so prepareSwapCalls uses it directly without additional scaling
        const { allCalls: swapCalls } = prepareSwapCalls({
          selectedTokenAddress: selectedToken.address,
          paymentToken: quote.paymentToken,
          totalCostWithQuantity,
          swapQuote,
          chainId: controller.chainId(),
        });

        allCalls = swapCalls;
      }

      const amount256 = uint256.bnToUint256(totalCostWithQuantity);

      const approvePaymentTokenCall: Call = {
        contractAddress: quote.paymentToken,
        entrypoint: "approve",
        calldata: [registryContract, amount256.low, amount256.high],
      };

      const referralData = getCurrentReferral(origin);

      const issueCall: Call = {
        contractAddress: registryContract,
        entrypoint: "issue",
        calldata: [
          recipient,
          packId,
          quantity,
          ...(referralData?.refAddress
            ? [0x0, num.toHex(referralData.refAddress)]
            : [0x1]),
          ...(referralData?.refGroup
            ? [0x0, num.toHex(cairo.felt(referralData.refGroup))]
            : [0x1]),
        ],
      };

      allCalls = [...allCalls, approvePaymentTokenCall, issueCall];

      let purchaseTransactionHash: string;

      if (walletType === "controller") {
        const result = await controller.execute(allCalls);
        purchaseTransactionHash = result.transaction_hash;
      } else {
        if (!externalSendTransaction) {
          throw new Error(
            "externalSendTransaction is required for external wallet type",
          );
        }

        const externalCalls = allCalls.map((call) => ({
          contract_address: call.contractAddress,
          entry_point: call.entrypoint,
          calldata: call.calldata,
        }));

        const response = await externalSendTransaction(
          walletType,
          externalCalls,
        );
        if (!response.success) {
          throw new ExternalWalletError(
            response.error || `Failed to execute purchase with ${walletType}`,
          );
        }
        if (!response.result) {
          throw new ExternalWalletError(
            `No transaction hash returned from ${walletType}`,
          );
        }
        const result = response.result as { transaction_hash?: string };
        const transactionHash = result.transaction_hash;
        if (!transactionHash) {
          throw new ExternalWalletError(
            `Invalid response format from ${walletType}: missing transaction_hash`,
          );
        }
        purchaseTransactionHash = transactionHash;
      }

      setTransactionHash(purchaseTransactionHash);
    } catch (e) {
      setDisplayError(e as Error);
      throw e;
    }
  }, [
    controller,
    starterpackDetails,
    origin,
    selectedToken,
    swapQuote,
    selectedWallet,
    quantity,
    externalSendTransaction,
    setTransactionHash,
    setDisplayError,
  ]);

  const contextValue: OnchainPurchaseContextType = {
    purchaseItems,
    quantity,
    incrementQuantity,
    decrementQuantity,
    selectedWallet,
    selectedPlatform,
    walletAddress,
    clearSelectedWallet,
    availableTokens,
    selectedToken,
    setSelectedToken,
    convertedPrice,
    swapQuote,
    isFetchingConversion,
    isTokenSelectionLocked,
    conversionError,
    usdAmount,
    layerswapFees,
    isFetchingFees,
    isSendingDeposit,
    swapId,
    explorer,
    requestedAmount,
    setRequestedAmount,
    depositAmount,
    feeEstimationError,
    onOnchainPurchase,
    onExternalConnect,
    onSendDeposit,
    waitForDeposit,
  };

  return (
    <OnchainPurchaseContext.Provider value={contextValue}>
      {children}
    </OnchainPurchaseContext.Provider>
  );
};

export const useOnchainPurchaseContext = () => {
  const context = useContext(OnchainPurchaseContext);
  if (!context) {
    throw new Error(
      "useOnchainPurchaseContext must be used within OnchainPurchaseProvider",
    );
  }
  return context;
};
