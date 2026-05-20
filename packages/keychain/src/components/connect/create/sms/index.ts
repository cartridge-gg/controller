import { useCallback } from "react";
import { TurnkeyBrowserClient } from "@turnkey/sdk-browser";
import { ApiKeyStamper, SignatureFormat } from "@turnkey/api-key-stamper";
import { encryptOtpCodeToBundle, generateP256KeyPair } from "@turnkey/crypto";
import {
  buildClientSignatureMessage,
  fetchApi,
  getOrCreateWallet,
  TurnkeyClientSignature,
} from "@/wallets/social/turnkey_utils";
import { WalletAdapter } from "@cartridge/controller";
import { useConnection } from "@/hooks/connection";
import { TurnkeyWallet } from "@/wallets/social/turnkey";

type InitSmsInput = { phoneNumber: string } | { username: string };

type InitSmsResponse = {
  otpId: string;
  otpEncryptionTargetBundle: string;
  // Only present when init was called with { username }.
  phoneLast4?: string;
};

type VerifySmsResponse = {
  verificationToken: string;
  // Server-resolved suborg when one already exists for this signer. When
  // absent, the client falls back to looking up by phone or creating one.
  subOrganizationId?: string;
};

// Thrown when initSms({ username }) finds no SMS signer for that username.
// Callers should silently fall back to the phone-entry flow.
export class SmsUsernameNotFoundError extends Error {
  constructor() {
    super("No SMS signer found for username");
    this.name = "SmsUsernameNotFoundError";
  }
}

// Each in-flight OTP attempt gets a P-256 keypair held here until the user
// submits the verification code. The same key is sent to InitOtp (embedded
// in the verificationToken JWT) and used to sign the OTP_LOGIN
// clientSignature; OtpLogin then associates it with the suborg as a session
// API key. Cleared after completeSms succeeds or throws.
const otpKeyPairs = new Map<
  string,
  { publicKey: string; privateKey: string }
>();

export const useSmsAuthentication = () => {
  const { chainId, rpcUrl } = useConnection();

  const initSms = useCallback(async (input: InitSmsInput) => {
    const keyPair = generateP256KeyPair();

    const body: Record<string, unknown> = { publicKey: keyPair.publicKey };
    if ("phoneNumber" in input) {
      body.phoneNumber = input.phoneNumber;
    } else {
      body.username = input.username;
    }

    let response: InitSmsResponse;
    try {
      response = await fetchApi<InitSmsResponse>("sms", body);
    } catch (err) {
      // doFetch surfaces HTTP errors as `HTTP error <status>: ...`. A 404 on
      // the username path means no SMS signer is registered for that username
      // — callers should silently fall back to manual phone entry. The
      // backend also returns 404 to avoid enumeration leaks (no signer,
      // decrypt failed, etc.), all of which map to the same fallback.
      if (
        "username" in input &&
        err instanceof Error &&
        err.message.startsWith("HTTP error 404")
      ) {
        throw new SmsUsernameNotFoundError();
      }
      throw err;
    }

    otpKeyPairs.set(response.otpId, keyPair);

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

      const keyPair = otpKeyPairs.get(otpId);
      if (!keyPair) {
        throw new Error(
          "OTP session not found — initSms must be called first for this otpId",
        );
      }

      try {
        const encryptedOtpBundle = await encryptOtpCodeToBundle(
          otpCode,
          otpEncryptionTargetBundle,
          keyPair.publicKey,
        );

        const verifyResponse = await fetchApi<VerifySmsResponse>("sms/verify", {
          otpId,
          encryptedOtpBundle,
        });

        if (!verifyResponse?.verificationToken) {
          throw new Error("SMS verification failed: no verification token");
        }

        // /oauth2/sms/verify is authoritative for suborg resolution: it
        // returns the id when one exists for this phone, an empty string
        // only when Turnkey definitively reports none, and a 5xx if the
        // lookup itself failed. So a non-empty value means "use this",
        // and empty means "no suborg exists — safe to create one". We
        // intentionally do NOT retry the lookup here: a transient Turnkey
        // failure that slipped through as empty would route an existing
        // user into the fresh-signup path and duplicate their account.
        let subOrgId: string | undefined = verifyResponse.subOrganizationId;
        if (!subOrgId) {
          if (!phoneNumber) {
            throw new Error(
              "Cannot resolve suborg: verify response missing subOrganizationId and no phone number available",
            );
          }
          const createResponse = await fetchApi<{
            subOrganizationId: string;
          }>("create-suborg", {
            rootUserUserName: username,
            phoneNumber,
          });
          subOrgId = createResponse.subOrganizationId;
        }

        const { message, verificationPublicKey } = buildClientSignatureMessage(
          verifyResponse.verificationToken,
        );

        if (verificationPublicKey !== keyPair.publicKey) {
          throw new Error(
            "Verification token publicKey does not match our session publicKey",
          );
        }

        // Sign the OTP_LOGIN message with the same P-256 key whose pubkey
        // was sent at InitOtp. The backend expects raw r||s (128 hex chars).
        const sessionStamper = new ApiKeyStamper({
          apiPublicKey: keyPair.publicKey,
          apiPrivateKey: keyPair.privateKey,
        });
        const rawSignature = await sessionStamper.sign(
          message,
          SignatureFormat.Raw,
        );

        const clientSignature: TurnkeyClientSignature = {
          publicKey: keyPair.publicKey,
          scheme: "CLIENT_SIGNATURE_SCHEME_API_P256",
          message,
          signature: rawSignature,
        };

        // OtpLogin associates our keypair with this suborg as a session API
        // key. The response body carries a session JWT (organizationId/expiry)
        // that we don't need client-side — future calls stamp with the keys
        // we already hold.
        await fetchApi("sms/login", {
          suborgID: subOrgId,
          verificationToken: verifyResponse.verificationToken,
          targetPublicKey: keyPair.publicKey,
          clientSignature,
        });

        const apiKeyClient = new TurnkeyBrowserClient({
          apiBaseUrl: import.meta.env.VITE_TURNKEY_BASE_URL,
          organizationId: subOrgId,
          stamper: sessionStamper,
        });

        const walletAddress = await getOrCreateWallet(
          subOrgId,
          username,
          apiKeyClient,
        );

        const turnkeyWallet = new TurnkeyWallet(
          username,
          chainId,
          rpcUrl,
          undefined,
        );
        turnkeyWallet.account = walletAddress;
        turnkeyWallet.subOrganizationId = subOrgId;
        turnkeyWallet.apiKeyClient = apiKeyClient;

        window.keychain_wallets?.addEmbeddedWallet(
          walletAddress,
          turnkeyWallet as unknown as WalletAdapter,
        );

        return {
          address: walletAddress,
          signer: { eip191: { address: walletAddress } },
          type: "sms" as const,
        };
      } finally {
        otpKeyPairs.delete(otpId);
      }
    },
    [chainId, rpcUrl],
  );

  return {
    initSms,
    completeSms,
  };
};
