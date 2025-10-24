import { useNavigation, usePurchaseContext } from "@/context";
import {
  Button,
  GiftIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  ErrorAlertIcon,
  Card,
  CardContent,
} from "@cartridge/ui";
import { Receiving } from "../../receiving";
import { OnchainCostBreakdown } from "../../review/cost";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { useConnection } from "@/hooks/connection";
import { isOnchainStarterpack } from "@/context";
import { uint256, Call } from "starknet";
import { getTokenSymbol } from "../../review/token-utils";

export function OnchainCheckout() {
  const {
    purchaseItems,
    displayError,
    starterpackDetails,
    selectedWallet,
    walletAddress,
    setTransactionHash,
    clearError,
  } = usePurchaseContext();
  const { navigate } = useNavigation();
  const { controller } = useConnection();
  const [isChecking, setIsChecking] = useState(true);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Extract quote and ID from onchain starterpack
  const { quote, starterpackId } = useMemo(() => {
    if (!starterpackDetails || !isOnchainStarterpack(starterpackDetails)) {
      return { quote: null, starterpackId: null };
    }
    return {
      quote: starterpackDetails.quote,
      starterpackId: starterpackDetails.id,
    };
  }, [starterpackDetails]);

  // Check if user has sufficient balance
  const hasSufficientBalance = useMemo(() => {
    if (!quote || balance === null) return false;
    return balance >= quote.totalCost;
  }, [balance, quote]);

  // Fetch user's token balance
  useEffect(() => {
    // Reset balance when wallet selection changes
    setBalance(null);
    setIsChecking(true);

    const checkBalance = async () => {
      if (!controller || !quote) {
        setIsChecking(false);
        return;
      }

      // Use external wallet address for Argent/Braavos, otherwise use controller address
      const isExternalStarknetWallet =
        selectedWallet?.type === "argent" || selectedWallet?.type === "braavos";
      const addressToCheck =
        isExternalStarknetWallet && walletAddress
          ? walletAddress
          : controller.address();

      try {
        // Call balanceOf on the payment token contract
        const result = await controller.provider.callContract({
          contractAddress: quote.paymentToken,
          entrypoint: "balanceOf",
          calldata: [addressToCheck],
        });

        // Parse the u256 balance (2 felts: low, high)
        const balanceBN = uint256.uint256ToBN({
          low: result[0],
          high: result[1],
        });

        setBalance(balanceBN);
      } catch (error) {
        console.error("Failed to fetch token balance:", error);
        // Set balance to 0 on error so we show insufficient balance message
        setBalance(0n);
      } finally {
        setIsChecking(false);
      }
    };

    checkBalance();
  }, [controller, quote, selectedWallet, walletAddress]);

  const onPurchase = useCallback(async () => {
    if (!controller || !quote || !starterpackId || !hasSufficientBalance)
      return;

    setIsLoading(true);
    try {
      const registryContract = import.meta.env
        .VITE_STARTERPACK_REGISTRY_CONTRACT;
      const recipient = controller.address();

      // Convert totalCost to u256 (low, high)
      const amount256 = uint256.bnToUint256(quote.totalCost);

      // Step 1: Approve payment token for the exact transfer amount
      const approveCalls: Call[] = [
        {
          contractAddress: quote.paymentToken,
          entrypoint: "approve",
          calldata: [
            registryContract, // spender
            amount256.low, // amount low
            amount256.high, // amount high
          ],
        },
      ];

      // Step 2: Issue the starterpack
      // issue(recipient, starterpack_id, quantity, referrer: Option<ContractAddress>, referrer_group: Option<felt252>)
      const issueCalls: Call[] = [
        {
          contractAddress: registryContract,
          entrypoint: "issue",
          calldata: [
            recipient, // recipient
            starterpackId, // starterpack_id: u32
            0x1, // quantity: u32 (always 1 for now)
            0x1, // referrer: Option<ContractAddress> (None)
            0x1, // referrer_group: Option<felt252> (None)
          ],
        },
      ];

      // Execute both calls in sequence
      const calls = [...approveCalls, ...issueCalls];
      const result = await controller.execute(calls);

      // Store transaction hash and navigate to pending
      setTransactionHash(result.transaction_hash);
      navigate("/purchase/pending", { reset: true });
    } catch (error) {
      console.error("Purchase failed:", error);
      // Error will be displayed via displayError in the UI
    } finally {
      setIsLoading(false);
    }
  }, [
    controller,
    quote,
    starterpackId,
    hasSufficientBalance,
    setTransactionHash,
    navigate,
  ]);

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  if (!quote) {
    return (
      <ControllerErrorAlert
        error={new Error("Invalid starterpack configuration")}
      />
    );
  }

  const tokenSymbol = getTokenSymbol(quote.paymentToken);
  return (
    <>
      <HeaderInner
        title="Review Purchase"
        icon={<GiftIcon variant="solid" />}
      />
      <LayoutContent>
        <Receiving title="Receiving" items={purchaseItems} />
      </LayoutContent>
      <LayoutFooter>
        {/* Insufficient Balance Warning */}
        {!isChecking && !hasSufficientBalance && (
          <Card className="border-warning">
            <CardContent className="flex flex-row items-center gap-3 p-3 text-warning">
              <ErrorAlertIcon variant="warning" size="sm" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold">Insufficient Balance</p>
                <p className="text-xs text-foreground-300">
                  You need more {tokenSymbol} to complete this purchase. Please
                  add funds or swap tokens.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <OnchainCostBreakdown quote={quote} />
        {displayError && <ControllerErrorAlert error={displayError} />}
        <Button
          onClick={onPurchase}
          isLoading={isLoading || isChecking}
          disabled={!hasSufficientBalance || !!displayError || isChecking}
        >
          {!hasSufficientBalance && !isChecking
            ? "Insufficient Balance"
            : "Confirm"}
        </Button>
      </LayoutFooter>
    </>
  );
}
