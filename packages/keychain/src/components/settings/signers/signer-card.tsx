import { useController } from "@/hooks/controller";
import { AUTH_METHODS_LABELS } from "@/utils/connection/constants";
import { fetchApi } from "@/wallets/social/turnkey_utils";
import { AuthOption } from "@cartridge/controller";
import {
  Button,
  Card,
  DiscordIcon,
  MetaMaskIcon,
  PhantomIcon,
  RabbyIcon,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  Skeleton,
  StarknetIcon,
  TouchIcon,
  TrashIcon,
  WalletConnectIcon,
} from "@cartridge/ui";
import { cn, formatAddress } from "@cartridge/ui/utils";
import { CredentialMetadata } from "@cartridge/ui/utils/api/cartridge";
import React, { useEffect, useState } from "react";
import { credentialToAddress, credentialToAuth } from "../../connect/types";
export interface Signer {
  signer: CredentialMetadata;
}

export interface SignerCardProps extends Signer {
  onDelete?: () => void;
  current?: boolean;
}

export const SignerCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SignerCardProps
>(({ className, signer, onDelete, current, ...props }, ref) => {
  const signerType = credentialToAuth(signer);
  const { controller } = useController();

  const [signerIdentifyingInfo, setSignerIdentifyingInfo] = useState<
    string | undefined
  >("pending");

  useEffect(() => {
    getSignerIdentifyingInfo(signer, controller?.username()).then(
      (username) => {
        setSignerIdentifyingInfo(username);
      },
    );
  }, [signer, controller]);

  return (
    <Sheet>
      <div
        ref={ref}
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <Card className="py-2.5 px-3 flex flex-1 flex-row justify-between items-center bg-background-200">
          <div className="flex flex-row items-center gap-1.5">
            <SignerIcon signerType={signerType} />
            <p className="flex-1 text-sm font-normal">
              {signerType
                ? `${AUTH_METHODS_LABELS[signerType]} ${current ? "(current)" : ""}`
                : "Unknown"}
            </p>
          </div>
          {signerIdentifyingInfo === "pending" ? (
            <Skeleton className="w-10 h-4" />
          ) : (
            <p className="text-sm font-normal text-foreground-300">
              {signerIdentifyingInfo}
            </p>
          )}
        </Card>
        {/* disabled until delete signer functionality is implemented */}
        {/* <SheetTrigger asChild> */}
        {/*   <Button variant="icon" size="icon" type="button"> */}
        {/*     <TrashIcon size="default" className="text-foreground-300" /> */}
        {/*   </Button> */}
        {/* </SheetTrigger> */}
      </div>

      {/* DELETE SIGNER SHEET CONTENTS */}
      <SheetContent
        side="bottom"
        className="border-background-100 p-6 gap-6 rounded-t-xl"
        showClose={false}
      >
        <div className="flex flex-row items-center gap-3 mb-6">
          <Button
            type="button"
            variant="icon"
            size="icon"
            className="flex items-center justify-center text-foreground-100"
          >
            <SignerIcon signerType={signerType} />
          </Button>
          <div className="flex flex-col items-start gap-1">
            <h3 className="text-lg font-semibold text-foreground-100">
              {signerType ? AUTH_METHODS_LABELS[signerType] : "Unknown"}
            </h3>
          </div>
        </div>
        <SheetFooter className="flex flex-row items-center gap-4">
          <SheetClose asChild className="flex-1">
            <Button variant="secondary">Cancel</Button>
          </SheetClose>
          <Button
            variant="secondary"
            onClick={onDelete}
            className="flex-1 text-destructive-100"
          >
            <TrashIcon size="default" />
            <span>DELETE</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
});

SignerCard.displayName = "SignerCard";

const SignerIcon = React.memo(
  ({ signerType }: { signerType: AuthOption | undefined }) => {
    if (!signerType) {
      return <TouchIcon size="sm" />;
    }

    switch (signerType) {
      case "argent":
        return <StarknetIcon size="sm" />;
      case "webauthn":
        return <TouchIcon size="sm" />;
      case "phantom":
        return <PhantomIcon size="sm" />;
      case "rabby":
        return <RabbyIcon size="sm" />;
      case "metamask":
        return <MetaMaskIcon size="sm" />;
      case "discord":
        return <DiscordIcon size="sm" />;
      case "walletconnect":
        return <WalletConnectIcon size="sm" />;
      default:
        return <TouchIcon size="sm" />;
    }
  },
);

const getSignerIdentifyingInfo = async (
  signer: CredentialMetadata,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _controllerUsername: string | undefined,
) => {
  switch (signer.__typename) {
    case "Eip191Credentials":
      if (signer.eip191?.[0]?.provider === "discord") {
        return undefined;
        // return await getDiscordUsername(controllerUsername);
      } else {
        return formatAddress(credentialToAddress(signer)!, { size: "xs" });
      }
    case "WebauthnCredentials":
      return undefined;
    case "SIWSCredentials":
      return "Phantom";
    case "StarknetCredentials":
      return "Starknet";
  }
};

export const getDiscordUsername = async (
  controllerUsername: string | undefined,
) => {
  try {
    const getOauthProvidersResponse = await fetchApi<GetOauthProvidersResponse>(
      "get-oauth-providers",
      {
        controllerUsername: controllerUsername,
      },
    );
    return getOauthProvidersResponse.find(
      (provider) => provider.providerName === "discord",
    )?.subject;
  } catch (error) {
    if (error instanceof Error && error.message.includes("status: 500")) {
      return undefined;
    }
    console.error(error);
    return undefined;
  }
};

type GetOauthProvidersResponse = {
  audience: string;
  createdAt: { nanos: string; seconds: string };
  issuer: string;
  providerId: string;
  providerName: string;
  subject: string;
  updatedAt: { nanos: string; seconds: string };
}[];
