import { useAccount } from "#profile/hooks/account";
import { useConnection } from "#profile/hooks/context";
import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  Button,
  CheckboxCheckedIcon,
  CheckboxUncheckedIcon,
  Skeleton,
  Empty,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Call,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
  uint256,
} from "starknet";
import { SendRecipient } from "../../../modules/recipient";
import { useCollectible } from "#profile/hooks/collectible";
import { Sending } from "./collectible-sending";
import { useEntrypoints } from "#profile/hooks/entrypoints";
import placeholder from "/public/placeholder.svg";
import { SendAmount } from "./amount";
import { SendHeader } from "./header";
const SAFE_TRANSFER_FROM_CAMEL_CASE = "safeTransferFrom";
const SAFE_TRANSFER_FROM_SNAKE_CASE = "safe_transfer_from";

export function SendCollectible() {
  const { address: contractAddress, tokenId } = useParams();

  const [searchParams] = useSearchParams();
  const paramsTokenIds = searchParams.getAll("tokenIds");

  const { entrypoints } = useEntrypoints({
    address: contractAddress || "0x0",
  });
  const { address } = useAccount();
  const { provider, parent, closable } = useConnection();
  const [recipientValidated, setRecipientValidated] = useState(false);
  const [recipientWarning, setRecipientWarning] = useState<string>();
  const [recipientError, setRecipientError] = useState<Error | undefined>();
  const [amount, setAmount] = useState<number | undefined>(1);
  const [amountError, setAmountError] = useState<Error | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipientLoading, setRecipientLoading] = useState(false);

  const navigate = useNavigate();

  const [to, setTo] = useState("");

  const tokenIds = useMemo(() => {
    if (!tokenId) return [...paramsTokenIds];
    return [tokenId, ...paramsTokenIds];
  }, [tokenId, paramsTokenIds]);

  const { collectible, assets, status } = useCollectible({
    contractAddress: contractAddress,
    tokenIds,
  });

  const entrypoint: string | null = useMemo(() => {
    if (entrypoints.includes(SAFE_TRANSFER_FROM_SNAKE_CASE)) {
      return SAFE_TRANSFER_FROM_SNAKE_CASE;
    }
    if (entrypoints.includes(SAFE_TRANSFER_FROM_CAMEL_CASE)) {
      return SAFE_TRANSFER_FROM_CAMEL_CASE;
    }
    return null;
  }, [entrypoints]);

  const disabled = useMemo(() => {
    return (
      recipientLoading ||
      (!recipientValidated && !!recipientWarning) ||
      !!recipientError ||
      !!amountError
    );
  }, [
    recipientValidated,
    recipientWarning,
    recipientError,
    amountError,
    recipientLoading,
  ]);

  useEffect(() => {
    setRecipientValidated(false);
  }, [recipientWarning, setRecipientValidated]);

  const onSubmit = useCallback(
    async (to: string) => {
      setSubmitted(true);
      if (
        !contractAddress ||
        !tokenIds ||
        !tokenIds.length ||
        !to ||
        !!recipientError ||
        !entrypoint ||
        !amount ||
        !!amountError
      )
        return;
      setLoading(true);
      const formattedAmount = uint256.bnToUint256(BigInt(amount));
      // Fill the extra argument in case of safe transfer functions
      const calldata = entrypoint.includes("safe") ? [0] : [];
      const calls: Call[] = (tokenIds as string[]).map((id: string) => {
        const tokenId = uint256.bnToUint256(BigInt(id));
        return {
          contractAddress: contractAddress,
          entrypoint,
          calldata: [address, to, tokenId, formattedAmount, ...calldata],
        };
      });
      const res = await parent.openExecute(calls);
      if (res?.transactionHash) {
        await provider.waitForTransaction(res.transactionHash, {
          retryInterval: 1000,
          successStates: [
            TransactionExecutionStatus.SUCCEEDED,
            TransactionFinalityStatus.ACCEPTED_ON_L2,
          ],
        });
      }
      if (closable) {
        navigate(`../..?${searchParams.toString()}`);
      } else {
        navigate(`../../..?${searchParams.toString()}`);
      }
      setLoading(false);
    },
    [
      provider,
      tokenIds,
      contractAddress,
      address,
      parent,
      recipientError,
      entrypoint,
      closable,
      navigate,
      searchParams,
      amount,
      amountError,
    ],
  );

  const title = useMemo(() => {
    if (!collectible || !assets || assets.length === 0) return "";
    if (assets.length > 1) return `${assets.length} ${collectible.name}(s)`;
    return assets[0].name;
  }, [collectible, assets]);

  const image = useMemo(() => {
    if (!collectible || !assets) return placeholder;
    if (assets.length > 1) return collectible.imageUrl || placeholder;
    return assets[0].imageUrl || placeholder;
  }, [collectible, assets]);

  const balance = useMemo(() => {
    if (!collectible || !assets || assets.length !== 1) return 0;
    return assets[0].amount;
  }, [collectible, assets]);

  const handleBack = useCallback(() => {
    navigate(`..?${searchParams.toString()}`);
  }, [navigate, searchParams]);

  return (
    <LayoutContainer>
      <LayoutHeader className="hidden" onBack={handleBack} />
      {status === "loading" || !collectible || !assets ? (
        <LoadingState />
      ) : status === "error" ? (
        <EmptyState />
      ) : (
        <>
          <LayoutContent className="p-6 flex flex-col gap-6">
            <SendHeader image={image} title={title} />
            <SendRecipient
              to={to}
              setTo={setTo}
              submitted={submitted}
              setWarning={setRecipientWarning}
              setError={setRecipientError}
              setParentLoading={setRecipientLoading}
            />
            <SendAmount
              amount={amount}
              balance={balance}
              submitted={submitted}
              setAmount={setAmount}
              setError={setAmountError}
            />
            <Sending assets={assets} description={collectible.name} />
          </LayoutContent>

          <LayoutFooter
            className={cn(
              "relative flex flex-col items-center justify-center gap-y-4 bg-background",
            )}
          >
            <Warning
              warning={recipientWarning}
              validated={recipientValidated}
              setValidated={setRecipientValidated}
            />
            <div className="w-full flex items-center gap-3">
              <Button
                variant="secondary"
                type="button"
                className="w-1/3"
                isLoading={loading}
                onClick={() => navigate(`../../..?${searchParams.toString()}`)}
              >
                Cancel
              </Button>
              <Button
                disabled={disabled}
                type="submit"
                className="w-2/3"
                isLoading={loading}
                onClick={() => onSubmit(to)}
              >
                Review
              </Button>
            </div>
          </LayoutFooter>
        </>
      )}
    </LayoutContainer>
  );
}

const Warning = ({
  warning,
  validated,
  setValidated,
}: {
  warning: string | undefined;
  validated: boolean;
  setValidated: (validated: boolean) => void;
}) => {
  return (
    <div
      className={cn(
        "border border-destructive-100 rounded flex items-center gap-2 p-2 cursor-pointer select-none",
        !warning && "hidden",
      )}
      onClick={() => setValidated(!validated)}
    >
      {validated && (
        <CheckboxCheckedIcon className="text-destructive-100 min-h-5 min-w-5 hover:opacity-80" />
      )}
      {!validated && (
        <CheckboxUncheckedIcon className="text-destructive-100 min-h-5 min-w-5 hover:opacity-80" />
      )}
      <p className="text-xs text-destructive-100">{warning}</p>
    </div>
  );
};

const LoadingState = () => {
  return (
    <LayoutContent className="gap-6 select-none h-full overflow-hidden">
      <Skeleton className="min-h-10 w-full rounded" />
      <div className="flex flex-col">
        <Skeleton className="min-h-4 my-3 w-8 rounded" />
        <Skeleton className="min-h-10 w-full rounded" />
      </div>
      <div className="flex flex-col">
        <Skeleton className="min-h-4 my-3 w-8 rounded" />
        <Skeleton className="min-h-10 w-full rounded" />
      </div>
      <Skeleton className="min-h-[109px] w-full rounded" />
    </LayoutContent>
  );
};

const EmptyState = () => {
  return (
    <LayoutContent className="select-none h-full">
      <Empty
        title="No information found for this asset."
        icon="inventory"
        className="h-full"
      />
    </LayoutContent>
  );
};
