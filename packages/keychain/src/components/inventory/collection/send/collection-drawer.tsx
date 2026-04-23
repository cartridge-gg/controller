import {
  Button,
  CheckboxCheckedIcon,
  CheckboxUncheckedIcon,
  Drawer,
  DrawerContent,
  PaperPlaneIcon,
  Disclosure,
  Thumbnail,
  Spinner,
} from "@cartridge/controller-ui";
import { cn } from "@cartridge/controller-ui/utils";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SendRecipient } from "../../../modules/recipient";
import { useCollection } from "@/hooks/collection";
import placeholder from "/placeholder.svg?url";
import { createNavigationParams } from "../collection";

export function SendCollectionDrawer({
  disclosure,
  contractAddress,
  tokenIds,
}: {
  disclosure: Disclosure;
  contractAddress: string;
  tokenIds: string[];
}) {
  const [searchParams] = useSearchParams();

  const [recipientValidated, setRecipientValidated] = useState(false);
  const [recipientWarning, setRecipientWarning] = useState<string>();
  const [recipientError, setRecipientError] = useState<Error | undefined>();
  const [recipientLoading, setRecipientLoading] = useState(false);

  const [to, setTo] = useState("");

  const { collection, assets, status } = useCollection({
    contractAddress,
    tokenIds,
  });

  const url = useMemo(() => {
    if (
      recipientLoading ||
      (!recipientValidated && !!recipientWarning) ||
      !!recipientError ||
      status === "loading"
    ) {
      return "";
    } else {
      const sendParams = createNavigationParams(searchParams, tokenIds);
      sendParams.set("recipient", to);
      return `send?${sendParams.toString()}`;
    }
  }, [
    recipientValidated,
    recipientWarning,
    recipientError,
    recipientLoading,
    status,
    searchParams,
    tokenIds,
    to,
  ]);

  useEffect(() => {
    setRecipientValidated(false);
  }, [recipientWarning, setRecipientValidated]);

  const { title, image } = useMemo(() => {
    if (status === "loading")
      return { title: "Loading...", image: <Spinner size="xs" /> };
    if (!collection || !assets || assets.length === 0)
      return { title: "Unknown", image: null };
    if (assets.length > 1)
      return {
        title: `${assets.length} ${collection.name}(s)`,
        image: collection.imageUrls[0],
      };
    return {
      title: assets[0].name,
      image: assets[0].imageUrls[0],
    };
  }, [collection, assets, status]);

  return (
    <Drawer isOpen={disclosure.isOpen} onClose={disclosure.onClose}>
      <DrawerContent
        title="Send"
        icon={<PaperPlaneIcon size="lg" variant="solid" />}
        className="min-h-[200px]"
      >
        <div className="flex items-center gap-3 absolute top-4 left-[130px] max-w-[235px]">
          <div className="h-full p-2 flex items-center gap-1 bg-background-150 rounded overflow-hidden">
            <Thumbnail icon={image || placeholder} size="sm" />
            <p className="text-sm font-medium px-1 truncate">{title}</p>
          </div>
        </div>

        <SendRecipient
          to={to}
          setTo={setTo}
          submitted={false}
          setWarning={setRecipientWarning}
          setError={setRecipientError}
          setParentLoading={setRecipientLoading}
        />

        <Warning
          warning={recipientWarning}
          validated={recipientValidated}
          setValidated={setRecipientValidated}
        />

        <div className="flex-grow" />

        <Link to={url} className="w-full">
          <Button disabled={!url} type="submit" className="w-full">
            Review Send
          </Button>
        </Link>
      </DrawerContent>
    </Drawer>
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
