import { useConnection } from "@/hooks/connection";
import { fetchApi, getOrCreateWallet } from "@/wallets/social/turnkey_utils";
import { TurnkeyWallet } from "@/wallets/social/turnkey";
import { getIframePublicKey } from "@/wallets/social/turnkey";
import { WalletAdapter } from "@cartridge/controller";
import { useCallback } from "react";
import { encryptOtpCodeToBundle, generateP256KeyPair } from "@turnkey/crypto";
import { p256 } from "@noble/curves/p256";
import { sha256 } from "@noble/hashes/sha2";
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
      const otpVerificationKeyPair = generateP256KeyPair();

      const encryptedOtpBundle = await encryptOtpCodeToBundle(
        otpCode.trim(),
        otpEncryptionTargetBundle,
        otpVerificationKeyPair.publicKey,
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
        verifyResponse.verificationToken,
        otpVerificationKeyPair.publicKey,
        otpVerificationKeyPair.privateKey,
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
  const parts = verificationToken.trim().split(".");
  if (parts.length < 2 || !parts[1]) {
    throw new Error("Invalid verification token: missing payload");
  }

  try {
    return JSON.parse(decodeBase64urlToString(parts[1]));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid verification token: invalid payload (${reason})`);
  }
}

function decodeBase64urlToString(value: string): string {
  const base64 = value
    .trim()
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.trim().length / 4) * 4, "=");
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
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
  verificationToken: string,
  otpVerificationPublicKey: string,
  otpVerificationPrivateKey: string,
  sessionPublicKey: string,
): Promise<TurnkeyClientSignature> {
  const { message, publicKey } = getClientSignatureMessageForLogin(
    verificationToken,
    sessionPublicKey,
  );
  if (publicKey !== otpVerificationPublicKey) {
    throw new Error("OTP verification token public key does not match signer");
  }
  const signature = p256.sign(
    sha256(new TextEncoder().encode(message)),
    otpVerificationPrivateKey,
  );

  return {
    publicKey,
    scheme: "CLIENT_SIGNATURE_SCHEME_API_P256",
    message,
    signature: signature.toCompactHex(),
  };
}
