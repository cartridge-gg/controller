import {
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from "@/components/layout";
import { useAccount } from "@/hooks/account";
import { useConnection } from "@/hooks/context";
import {
  ArrowIcon,
  Button,
  CheckboxCheckedIcon,
  CheckboxUncheckedIcon,
  cn,
  CopyAddress,
  ScrollArea,
  Separator,
} from "@cartridge/ui-next";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Call, uint256 } from "starknet";
import { Recipient } from "../../../modules/recipient";
import { useCollection } from "@/hooks/collection";
import { Sending } from "./sending";
import { CollectionImage } from "../image";
import { useEntrypoints } from "@/hooks/entrypoints";

const SAFE_TRANSFER_FROM_CAMEL_CASE = "safeTransferFrom";
const SAFE_TRANSFER_FROM_SNAKE_CASE = "safe_transfer_from";
const TRANSFER_FROM_CAMEL_CASE = "transferFrom";
const TRANSFER_FROM_SNAKE_CASE = "transfer_from";

export function SendCollection() {
  const { address: collectionAddress } = useParams<{ address: string }>();

  const [searchParams] = useSearchParams();
  const paramsTokenIds = searchParams.getAll("tokenIds");
  const { tokenId } = useParams<{ tokenId: string }>();

  const { entrypoints } = useEntrypoints({
    address: collectionAddress || "0x0",
  });
  const { address } = useAccount();
  const { parent } = useConnection();
  const [recipientValidated, setRecipientValidated] = useState(false);
  const [recipientWarning, setRecipientWarning] = useState<string>();
  const navigate = useNavigate();

  const [to, setTo] = useState("");

  const tokenIds = useMemo(() => {
    if (!tokenId) return [...paramsTokenIds];
    return [tokenId, ...paramsTokenIds];
  }, [tokenId, paramsTokenIds]);

  const { collection, assets } = useCollection({ tokenIds });

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
    return (!recipientValidated && !!recipientWarning) || !to;
  }, [recipientValidated, to, recipientWarning]);

  useEffect(() => {
    setRecipientValidated(false);
  }, [recipientWarning, setRecipientValidated]);

  const onSubmit = useCallback(
    async (to: string) => {
      if (
        !collectionAddress ||
        !tokenIds ||
        !tokenIds.length ||
        !to ||
        !entrypoint
      )
        return;
      // Fill the extra argument in case of safe transfer functions
      const calldata = entrypoint.includes("safe") ? [0] : [];
      const calls: Call[] = (tokenIds as string[]).map((id: string) => {
        const tokenId = uint256.bnToUint256(BigInt(id));
        return {
          contractAddress: collectionAddress,
          entrypoint,
          calldata: [address, to, tokenId, ...calldata],
        };
      });
      await parent.openExecute(calls);
      navigate("../../..");
    },
    [tokenIds, collectionAddress, address, parent, entrypoint, navigate],
  );

  if (!collection || !assets) return null;

  return (
    <LayoutContainer
      left={
        <Link to="..">
          <Button variant="icon" size="icon">
            <ArrowIcon variant="left" />
          </Button>
        </Link>
      }
    >
      <LayoutHeader
        title={`Send (${tokenIds.length}) ${collection.name}`}
        description={<CopyAddress address={address} size="sm" />}
        icon={<CollectionImage imageUrl={collection.imageUrl} size="xs" />}
      />
      <LayoutContent className="gap-6">
        <Recipient to={to} setTo={setTo} setWarning={setRecipientWarning} />
        <ScrollArea className="overflow-auto">
          <Sending assets={assets} />
        </ScrollArea>
      </LayoutContent>

      <LayoutFooter className="bg-background relative pt-0">
        <Separator className="bg-spacer" />
        <Warning
          warning={recipientWarning}
          validated={recipientValidated}
          setValidated={setRecipientValidated}
        />
        <Button
          disabled={disabled}
          type="submit"
          className="w-full"
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
        "border border-destructive rounded flex items-center gap-2 p-2 cursor-pointer select-none",
        !warning && "hidden",
      )}
      onClick={() => setValidated(!validated)}
    >
      {validated && (
        <CheckboxCheckedIcon className="text-destructive min-h-5 min-w-5 hover:opacity-80" />
      )}
      {!validated && (
        <CheckboxUncheckedIcon className="text-destructive min-h-5 min-w-5 hover:opacity-80" />
      )}
      <p className="text-xs text-destructive">{warning}</p>
    </div>
  );
};
