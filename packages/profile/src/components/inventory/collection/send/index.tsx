import { useAccount } from "#hooks/account";
import { useConnection } from "#hooks/context";
import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  Button,
  CheckboxCheckedIcon,
  CheckboxUncheckedIcon,
  cn,
} from "@cartridge/ui-next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Call,
  TransactionExecutionStatus,
  TransactionFinalityStatus,
  uint256,
} from "starknet";
import { SendRecipient } from "../../../modules/recipient";
import { useCollection } from "#hooks/collection";
import { Sending } from "./sending";
import { useEntrypoints } from "#hooks/entrypoints";
import { CollectionHeader } from "../header";
import placeholder from "/public/placeholder.svg";
import { formatName } from "../helper";
const SAFE_TRANSFER_FROM_CAMEL_CASE = "safeTransferFrom";
const SAFE_TRANSFER_FROM_SNAKE_CASE = "safe_transfer_from";
const TRANSFER_FROM_CAMEL_CASE = "transferFrom";
const TRANSFER_FROM_SNAKE_CASE = "transfer_from";

export function SendCollection() {
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
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipientLoading, setRecipientLoading] = useState(false);

  const navigate = useNavigate();

  const [to, setTo] = useState("");

  const tokenIds = useMemo(() => {
    if (!tokenId) return [...paramsTokenIds];
    return [tokenId, ...paramsTokenIds];
  }, [tokenId, paramsTokenIds]);

  const { collection, assets } = useCollection({
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
    if (entrypoints.includes(TRANSFER_FROM_SNAKE_CASE)) {
      return TRANSFER_FROM_SNAKE_CASE;
    }
    if (entrypoints.includes(TRANSFER_FROM_CAMEL_CASE)) {
      return TRANSFER_FROM_CAMEL_CASE;
    }
    return null;
  }, [entrypoints]);

  const disabled = useMemo(() => {
    return (
      recipientLoading ||
      (!recipientValidated && !!recipientWarning) ||
      !!recipientError
    );
  }, [recipientValidated, recipientWarning, recipientError, recipientLoading]);

  useEffect(() => {
    setRecipientValidated(false);
  }, [recipientWarning, setRecipientValidated]);

  const onSubmit = useCallback(
    async (to: string) => {
      setLoading(true);
      setSubmitted(true);
      if (
        !contractAddress ||
        !tokenIds ||
        !tokenIds.length ||
        !to ||
        !!recipientError ||
        !entrypoint
      )
        return;
      // Fill the extra argument in case of safe transfer functions
      const calldata = entrypoint.includes("safe") ? [0] : [];
      const calls: Call[] = (tokenIds as string[]).map((id: string) => {
        const tokenId = uint256.bnToUint256(BigInt(id));
        return {
          contractAddress: contractAddress,
          entrypoint,
          calldata: [address, to, tokenId, ...calldata],
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
    ],
  );

  const title = useMemo(() => {
    if (!collection || !assets || assets.length === 0) return "";
    if (assets.length > 1) return `Send (${assets.length}) ${collection.name}`;
    const asset = assets[0];
    return `Send ${formatName(asset.name, asset.tokenId)}`;
  }, [collection, assets]);

  const image = useMemo(() => {
    if (!collection || !assets) return placeholder;
    if (assets.length > 1) return collection.imageUrl || placeholder;
    return assets[0].imageUrl || placeholder;
  }, [collection, assets]);

  const handleBack = useCallback(() => {
    navigate(`..?${searchParams.toString()}`);
  }, [navigate, searchParams]);

  if (!collection || !assets) return null;

  return (
    <LayoutContainer>
      <LayoutHeader className="hidden" onBack={handleBack} />
      <LayoutContent className="p-6 flex flex-col gap-6">
        <CollectionHeader image={image} title={title} />
        <SendRecipient
          to={to}
          setTo={setTo}
          submitted={submitted}
          setWarning={setRecipientWarning}
          setError={setRecipientError}
          setParentLoading={setRecipientLoading}
        />
        <Sending assets={assets} description={collection.name} />
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
        <Button
          disabled={disabled}
          type="submit"
          className="w-full"
          isLoading={loading}
          onClick={() => onSubmit(to)}
        >
          Review Send
        </Button>
      </LayoutFooter>
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
