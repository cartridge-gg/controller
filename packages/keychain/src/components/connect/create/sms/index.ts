import { useConnection } from "@/hooks/connection";
import { fetchApi, getOrCreateWallet } from "@/wallets/social/turnkey_utils";
import { TurnkeyWallet } from "@/wallets/social/turnkey";
import { getIframePublicKey } from "@/wallets/social/turnkey";
import { WalletAdapter } from "@cartridge/controller";
import { useCallback } from "react";
import { Turnkey, TurnkeyIframeClient } from "@turnkey/sdk-browser";

type InitSmsResponse = {
  otpId: string;
  otpEncryptionTargetBundle: string;
};

type VerifySmsResponse = {
  credentialBundle: string;
};

let iframeClientPromise: Promise<TurnkeyIframeClient> | null = null;

function getIframeClient(): Promise<TurnkeyIframeClient> {
  if (iframeClientPromise) return iframeClientPromise;

  const turnkeySdk = new Turnkey({
    apiBaseUrl: import.meta.env.VITE_TURNKEY_BASE_URL,
    defaultOrganizationId: import.meta.env.VITE_TURNKEY_ORGANIZATION_ID,
  });

  let container = document.getElementById("turnkey-sms-iframe-container");
  if (!container) {
    container = document.createElement("div");
    container.style.display = "none";
    container.id = "turnkey-sms-iframe-container";
    document.body.appendChild(container);
  }

  iframeClientPromise = turnkeySdk
    .iframeClient({
      iframeContainer: container,
      iframeUrl: import.meta.env.VITE_TURNKEY_IFRAME_URL,
    })
    .then(async (client: TurnkeyIframeClient) => {
      await client.initEmbeddedKey();
      return client;
    });

  return iframeClientPromise;
}

export const useSmsAuthentication = () => {
  const { chainId, rpcUrl } = useConnection();

  const initSms = useCallback(async (phoneNumber: string) => {
    const response = await fetchApi<InitSmsResponse>("sms", {
      phoneNumber,
    });
    return response;
  }, []);

  const completeSms = useCallback(
    async (
      username: string,
      phoneNumber: string,
      otpId: string,
      otpCode: string,
    ) => {
      if (!chainId) {
        throw new Error("No chainId");
      }

      const iframeClient = await getIframeClient();

      // Get iframe public key for the credential bundle
      const targetPublicKey = await getIframePublicKey(iframeClient);

      // Look up or create sub-org by phone number
      const suborgResponse = await fetchApi<{ organizationIds: string[] }>(
        "suborgs",
        {
          filterType: "PHONE_NUMBER",
          filterValue: phoneNumber,
        },
      );

      let subOrgId: string;
      if (
        !suborgResponse?.organizationIds ||
        suborgResponse.organizationIds.length === 0
      ) {
        const createResponse = await fetchApi<{ subOrganizationId: string }>(
          "create-suborg",
          {
            rootUserUserName: username,
            phoneNumber,
          },
        );
        subOrgId = createResponse.subOrganizationId;
      } else {
        subOrgId = suborgResponse.organizationIds[0];
      }

      // Backend does verify OTP + login, returns credential bundle
      const verifyResponse = await fetchApi<VerifySmsResponse>("sms/verify", {
        otpId,
        otpCode,
        suborgID: subOrgId,
        targetPublicKey,
      });

      if (!verifyResponse?.credentialBundle) {
        throw new Error("SMS verification failed: no credential bundle");
      }

      // Inject credential bundle into iframe (same pattern as OAuth)
      const injectResult = await iframeClient.injectCredentialBundle(
        verifyResponse.credentialBundle,
      );
      if (!injectResult) {
        throw new Error("Failed to inject credentials into Turnkey");
      }

      // Get or create wallet
      const walletAddress = await getOrCreateWallet(
        subOrgId,
        username,
        iframeClient,
      );

      // Register as embedded wallet for signing
      const turnkeyWallet = new TurnkeyWallet(
        username,
        chainId,
        rpcUrl,
        undefined,
      );
      turnkeyWallet.account = walletAddress;
      turnkeyWallet.subOrganizationId = subOrgId;

      window.keychain_wallets?.addEmbeddedWallet(
        walletAddress,
        turnkeyWallet as unknown as WalletAdapter,
      );

      return {
        address: walletAddress,
        signer: { eip191: { address: walletAddress } },
        type: "sms" as const,
      };
    },
    [chainId, rpcUrl],
  );

  return {
    initSms,
    completeSms,
  };
};
