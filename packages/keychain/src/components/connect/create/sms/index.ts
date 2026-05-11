import { useConnection } from "@/hooks/connection";
import { fetchApi, getOrCreateWallet } from "@/wallets/social/turnkey_utils";
import { TurnkeyWallet } from "@/wallets/social/turnkey";
import { getIframePublicKey } from "@/wallets/social/turnkey";
import { WalletAdapter } from "@cartridge/controller";
import { useCallback } from "react";
import { encryptOtpCodeToBundle, fromDerSignature } from "@turnkey/crypto";
import {
  decodeBase64urlToString,
  uint8ArrayToHexString,
} from "@turnkey/encoding";
import { Turnkey, TurnkeyIframeClient } from "@turnkey/sdk-browser";

type InitSmsResponse = {
  otpId: string;
  otpEncryptionTargetBundle: string;
};

type VerifySmsResponse = {
  verificationToken: string;
};

type SmsLoginResponse = {
  credentialBundle: string;
};

type TurnkeyClientSignature = {
  publicKey: string;
  scheme: "CLIENT_SIGNATURE_SCHEME_API_P256";
  message: string;
  signature: string;
};

type VerificationTokenPayload = {
  id?: string;
  public_key?: unknown;
};

type TurnkeyStamp = {
  publicKey?: string;
  signature?: string;
};

type TurnkeyStampResponse = {
  stampHeaderName: string;
  stampHeaderValue: string;
};

type TurnkeyStamper = {
  stamp: (payload: string) => Promise<TurnkeyStampResponse>;
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
      otpEncryptionTargetBundle: string,
      otpCode: string,
    ) => {
      if (!chainId) {
        throw new Error("No chainId");
      }

      const iframeClient = await getIframeClient();

      // Get iframe public key for the credential bundle
      const targetPublicKey = await getIframePublicKey(iframeClient);

      const encryptedOtpBundle = await encryptOtpCodeToBundle(
        otpCode.trim(),
        otpEncryptionTargetBundle,
        targetPublicKey,
      );

      const verifyResponse = await fetchApi<VerifySmsResponse>("sms/verify", {
        otpId,
        encryptedOtpBundle,
      });

      if (!verifyResponse?.verificationToken) {
        throw new Error("SMS verification failed: no verification token");
      }

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

      const clientSignature = await buildOtpLoginClientSignature(
        iframeClient,
        verifyResponse.verificationToken,
        targetPublicKey,
      );

      const loginResponse = await fetchApi<SmsLoginResponse>("sms/login", {
        suborgID: subOrgId,
        verificationToken: verifyResponse.verificationToken,
        targetPublicKey,
        clientSignature,
      });

      if (!loginResponse?.credentialBundle) {
        throw new Error("SMS verification failed: no credential bundle");
      }

      // Inject credential bundle into iframe (same pattern as OAuth)
      const injectResult = await iframeClient.injectCredentialBundle(
        loginResponse.credentialBundle,
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

function decodeVerificationToken(
  verificationToken: string,
): VerificationTokenPayload {
  const [, payloadB64] = verificationToken.split(".");
  if (!payloadB64) {
    throw new Error("Invalid verification token: missing payload");
  }

  return JSON.parse(decodeBase64urlToString(payloadB64));
}

function getClientSignatureMessageForLogin(
  verificationToken: string,
  sessionPublicKey: string,
) {
  const decoded = decodeVerificationToken(verificationToken);
  if (!decoded.id) {
    throw new Error("Invalid verification token: missing id");
  }
  if (!decoded.public_key) {
    throw new Error("Invalid verification token: missing public key");
  }

  const verificationPublicKey = String(decoded.public_key);
  const payload = {
    login: {
      publicKey: sessionPublicKey,
    },
    tokenId: decoded.id,
    type: "USAGE_TYPE_LOGIN",
  };

  return {
    message: JSON.stringify(payload),
    publicKey: verificationPublicKey,
  };
}

async function buildOtpLoginClientSignature(
  iframeClient: TurnkeyIframeClient,
  verificationToken: string,
  sessionPublicKey: string,
): Promise<TurnkeyClientSignature> {
  const { message, publicKey } = getClientSignatureMessageForLogin(
    verificationToken,
    sessionPublicKey,
  );
  const stamper = (iframeClient as unknown as { stamper?: TurnkeyStamper })
    .stamper;
  if (!stamper) {
    throw new Error("Turnkey iframe stamper is not available");
  }
  const stamp = await stamper.stamp(message);
  const decodedStamp = JSON.parse(
    decodeBase64urlToString(stamp.stampHeaderValue),
  ) as TurnkeyStamp;
  if (!decodedStamp.signature) {
    throw new Error("Turnkey iframe did not return a signature");
  }

  return {
    publicKey,
    scheme: "CLIENT_SIGNATURE_SCHEME_API_P256",
    message,
    signature: uint8ArrayToHexString(fromDerSignature(decodedStamp.signature)),
  };
}
