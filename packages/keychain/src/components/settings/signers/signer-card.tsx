import { useController } from "@/hooks/controller";
import { AUTH_METHODS_LABELS } from "@/utils/connection/constants";
import { fetchApi, SocialProvider } from "@/wallets/social/turnkey_utils";
import { AuthOption } from "@cartridge/controller";
import {
  Button,
  Card,
  DiscordIcon,
  GoogleIcon,
  MetaMaskIcon,
  PhantomIcon,
  RabbyIcon,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTitle,
  Skeleton,
  SpinnerIcon,
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
  onDelete?: () => Promise<void>;
  current?: boolean;
  isOriginalSigner: boolean;
}

let AAGUIDS: Record<string, Record<string, string>> | undefined = undefined;
let AAGUIDS_PROMISE:
  | Promise<Record<string, Record<string, string>>>
  | undefined = undefined;

export const SignerCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SignerCardProps
>(
  (
    { className, signer, onDelete, current, isOriginalSigner, ...props },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const signerType = credentialToAuth(signer);
    const { controller } = useController();
    const controllerUsername = controller?.username();
    const [signerIdentifyingInfo, setSignerIdentifyingInfo] = useState<
      string | undefined
    >("pending");

    useEffect(() => {
      getSignerIdentifyingInfo(signer, controllerUsername).then((username) => {
        setSignerIdentifyingInfo(username);
      });
    }, [signer, controllerUsername]);

    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
                  ? `${AUTH_METHODS_LABELS[signerType]} ${current ? "(current)" : ""} ${isOriginalSigner ? "(original)" : ""}`
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
          {!isOriginalSigner && !current && onDelete && (
            <Button
              variant="icon"
              size="icon"
              type="button"
              onClick={() => setIsOpen(true)}
            >
              <TrashIcon size="default" className="text-foreground-300" />
            </Button>
          )}
        </div>

        {/* DELETE SIGNER SHEET CONTENTS */}
        <SheetContent
          side="bottom"
          className="border-background-100 p-6 gap-6 rounded-t-xl"
          showClose={false}
        >
          <SheetTitle className="hidden"></SheetTitle>
          <div className="flex flex-row items-center gap-3 mb-6">
            <Button
              type="button"
              variant="icon"
              size="icon"
              className="flex items-center justify-center text-foreground-100"
            >
              {isLoading ? (
                <SpinnerIcon className="animate-spin" size="lg" />
              ) : (
                <SignerIcon signerType={signerType} size="lg" />
              )}
            </Button>
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-semibold text-foreground-100">
                {signerType ? AUTH_METHODS_LABELS[signerType] : "Unknown"}
              </h3>
            </div>
          </div>
          <SheetFooter className="flex flex-row items-center gap-4">
            <SheetClose asChild className="flex-1">
              <Button variant="secondary" disabled={isLoading}>
                Cancel
              </Button>
            </SheetClose>
            <Button
              variant="secondary"
              onClick={async () => {
                setIsLoading(true);
                try {
                  await onDelete?.();
                  setIsOpen(false);
                } catch (error) {
                  console.error(error);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="flex-1 text-destructive-100"
              disabled={isLoading}
            >
              <TrashIcon size="default" />
              <span>DELETE</span>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  },
);

SignerCard.displayName = "SignerCard";

const SignerIcon = React.memo(
  ({
    signerType,
    size = "default",
  }: {
    signerType: AuthOption | undefined;
    size?:
      | "xs"
      | "sm"
      | "lg"
      | "default"
      | "2xs"
      | "xl"
      | "2xl"
      | "3xl"
      | null
      | undefined;
  }) => {
    if (!signerType) {
      return <TouchIcon size="sm" />;
    }

    switch (signerType) {
      case "argent":
        return <StarknetIcon size={size} />;
      case "webauthn":
        return <TouchIcon size={size} />;
      case "phantom":
        return <PhantomIcon size={size} />;
      case "rabby":
        return <RabbyIcon size={size} />;
      case "metamask":
        return <MetaMaskIcon size={size} />;
      case "discord":
        return <DiscordIcon size={size} />;
      case "google":
        return <GoogleIcon size={size} />;
      case "walletconnect":
        return <WalletConnectIcon size={size} />;
      default:
        return <TouchIcon size={size} />;
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
      switch (signer.eip191?.[0]?.provider) {
        case "discord":
          // return await getOauthProvider(controllerUsername, "discord");
          return undefined;
        case "google":
          // return await getOauthProvider(controllerUsername, "google");
          return undefined;
        default:
          return formatAddress(credentialToAddress(signer)!, { size: "xs" });
      }
    case "WebauthnCredentials":
      if (!signer.webauthn?.[0].AAGUID) return;

      if (AAGUIDS) {
        return AAGUIDS[signer.webauthn?.[0].AAGUID]?.["name"];
      }

      if (AAGUIDS_PROMISE) {
        AAGUIDS = await AAGUIDS_PROMISE;
        return AAGUIDS[signer.webauthn?.[0].AAGUID]?.["name"];
      }

      AAGUIDS_PROMISE = fetch(
        "https://raw.githubusercontent.com/passkeydeveloper/passkey-authenticator-aaguids/refs/heads/main/aaguid.json",
      ).then((res) => res.json());

      AAGUIDS = await AAGUIDS_PROMISE;
      return AAGUIDS[signer.webauthn?.[0].AAGUID]?.["name"];

    case "SIWSCredentials":
      return "Phantom";
    case "StarknetCredentials":
      return "Starknet";
  }
};

export const getOauthProvider = async (
  controllerUsername: string | undefined,
  socialProvider: SocialProvider,
) => {
  try {
    const getOauthProvidersResponse = await fetchApi<GetOauthProvidersResponse>(
      "get-oauth-providers",
      {
        controllerUsername: controllerUsername,
      },
    );
    return getOauthProvidersResponse.find(
      (provider) => provider.providerName === socialProvider,
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
