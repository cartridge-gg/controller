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
  CheckboxCheckedDuoIcon,
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

export function SendCollection() {
  const { address: collectionAddress } = useParams<{ address: string }>();

  const [searchParams] = useSearchParams();
  const paramsTokenIds = searchParams.getAll("tokenIds");
  const { tokenId } = useParams<{ tokenId: string }>();

  const { address } = useAccount();
  const { parent } = useConnection();
  const [validated, setValidated] = useState(false);
  const [warning, setWarning] = useState<string>();
  const navigate = useNavigate();

  const [to, setTo] = useState("");

  const disabled = useMemo(() => {
    return (!validated && !!warning) || !to;
  }, [validated, to, warning]);

  const tokenIds = useMemo(() => {
    if (!tokenId) return [...paramsTokenIds];
    return [tokenId, ...paramsTokenIds];
  }, [tokenId, paramsTokenIds]);

  const { collection, assets } = useCollection({ tokenIds });

  useEffect(() => {
    setValidated(false);
  }, [warning, setValidated]);

  const onSubmit = useCallback(
    async (to: string) => {
      if (!collectionAddress || !tokenIds || !tokenIds.length || !to) return;
      const calls: Call[] = (tokenIds as string[]).map((id: string) => {
        const tokenId = uint256.bnToUint256(BigInt(id));
        return {
          contractAddress: collectionAddress,
          entrypoint: "transferFrom",
          calldata: [address, to, tokenId],
        };
      });
      await parent.openExecute(calls);
      navigate("../../..");
    },
    [tokenIds, collectionAddress, address, parent, navigate],
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
        <Recipient to={to} setTo={setTo} setWarning={setWarning} />
        <ScrollArea className="overflow-auto">
          <Sending assets={assets} />
        </ScrollArea>
      </LayoutContent>

      <LayoutFooter className="bg-background relative pt-0">
        <Separator className="bg-spacer" />
        <div
          className={cn(
            "border border-destructive rounded flex items-center gap-2 p-2 cursor-pointer select-none",
            !warning && "hidden",
          )}
          onClick={() => setValidated(!validated)}
        >
          {validated && (
            <CheckboxCheckedDuoIcon className="text-destructive min-h-5 min-w-5 hover:opacity-80" />
          )}
          {!validated && (
            <CheckboxUncheckedIcon className="text-destructive min-h-5 min-w-5 hover:opacity-80" />
          )}
          <p className="text-xs text-destructive">{warning}</p>
        </div>
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
