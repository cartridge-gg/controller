import { useController } from "@/hooks/controller";
import { AUTH_METHODS_LABELS } from "@/utils/connection/constants";
import { fetchApi, SocialProvider } from "@/wallets/social/turnkey_utils";
import { AuthOption } from "@cartridge/controller";
import {
  DiscordIcon,
  GoogleIcon,
  MetaMaskIcon,
  MobileIcon,
  PhantomIcon,
  RabbyIcon,
  SettingsCard,
  StarknetIcon,
  TouchIcon,
  WalletConnectIcon,
} from "@cartridge/controller-ui";
import { formatAddress } from "@cartridge/controller-ui/utils";
import { CredentialMetadata } from "@cartridge/controller-ui/utils/api/cartridge";
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

    const canDelete = !isOriginalSigner && !current && !!onDelete;
    const signerLabel = signerType
      ? AUTH_METHODS_LABELS[signerType]
      : "Unknown";
    const label = signerType
      ? `${signerLabel} ${current ? "(current)" : ""} ${isOriginalSigner ? "(original)" : ""}`
      : signerLabel;

    return (
      <SettingsCard
        ref={ref}
        className={className}
        icon={<SignerIcon signerType={signerType} />}
        label={label}
        rightText={signerIdentifyingInfo}
        isLoading={signerIdentifyingInfo === "pending"}
        onDelete={canDelete ? onDelete : undefined}
        confirm={canDelete ? "delete" : undefined}
        confirmLabel={`${signerLabel} Signer`}
        confirmSubTitle={signerIdentifyingInfo}
        {...props}
      />
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
      case "webauthn":
        return <TouchIcon size={size} />;
      case "sms":
        return <MobileIcon variant="solid" size={size} />;
      case "argent":
        return <StarknetIcon size={size} />;
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
        case "sms":
          if (signer.eip191?.[0]?.phoneLast4) {
            return `*** **** ${signer.eip191?.[0]?.phoneLast4}`;
          }
          return formatAddress(credentialToAddress(signer)!, { size: "xs" });
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
