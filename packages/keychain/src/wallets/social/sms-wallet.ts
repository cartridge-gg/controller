import { DisplayType } from "@/components/connect/create/sms/sms-authentication";
import { getPromiseWithResolvers } from "@/utils/promises";
import {
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
} from "@cartridge/controller";
import { OtpType } from "@turnkey/sdk-react";
import { TurnkeyWallet } from ".";
import {
  createSmsSuborg,
  getOrCreateWallet,
  getSmsSuborg,
  initOtpAuth,
  otpAuth,
} from "./turnkey_utils";

export class SmsWallet extends TurnkeyWallet {
  private phoneNumberPromise: Promise<string> | undefined = undefined;
  private smsOtpPromise: Promise<string> | undefined = undefined;

  constructor() {
    super();
    this.type = "sms" as ExternalWalletType;
  }

  isAvailable(): boolean {
    return (
      typeof window !== "undefined" &&
      !!this.turnkeyIframePromise &&
      !!this.phoneNumberPromise &&
      !!this.smsOtpPromise
    );
  }

  getInfo(): ExternalWallet {
    return {
      type: "sms" as ExternalWalletType,
      available: this.isAvailable(),
      name: "SMS",
      platform: "ethereum",
    };
  }

  async connect(
    username: string,
    connectType: "signup" | "login" | "add-signer",
  ): Promise<ExternalWalletResponse> {
    const {
      promise: phoneNumberPromise,
      resolve: phoneNumberResolve,
      reject: phoneNumberReject,
    } = getPromiseWithResolvers<string>();
    const {
      promise: smsOtpPromise,
      resolve: otpResolve,
      reject: otpReject,
    } = getPromiseWithResolvers<string>();

    const handlePhoneNumber = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail.error) {
        phoneNumberReject(new Error(customEvent.detail.error));
      } else {
        phoneNumberResolve(customEvent.detail.phoneNumber);
      }
    };
    const handleOtpCode = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail.error) {
        otpReject(new Error(customEvent.detail.error));
      } else {
        otpResolve(customEvent.detail.otpCode);
      }
    };

    this.phoneNumberPromise = phoneNumberPromise;
    this.smsOtpPromise = smsOtpPromise;

    window.dispatchEvent(
      new CustomEvent("show-sms-authentication", {
        detail: connectType as DisplayType,
      }),
    );

    window.addEventListener("sms-signer-phone-number", handlePhoneNumber);
    window.addEventListener("sms-signer-otp-code", handleOtpCode);

    try {
      const phoneNumber = await this.phoneNumberPromise;
      let subOrganizationId: string | undefined = undefined;
      if (connectType === "login" || connectType === "add-signer") {
        subOrganizationId = await getSmsSuborg(username, phoneNumber);
      } else {
        subOrganizationId = await createSmsSuborg(username, phoneNumber);
      }
      if (!subOrganizationId) {
        throw new Error("No subOrganizationId");
      }

      const turnkeyIframeClient = await this.getTurnkeyIframeClient(10_000);
      const iframePublicKey = await this.getIframePublicKey();
      const otpResponse = await initOtpAuth(
        OtpType.Sms,
        phoneNumber,
        subOrganizationId,
      );
      const otpCode = await this.smsOtpPromise;
      const otpResult = await otpAuth(
        otpResponse.otpId,
        otpCode,
        iframePublicKey,
        subOrganizationId,
      );
      if (!otpResult.credentialBundle) {
        throw new Error("No credentialBundle");
      }
      const injectResponse = await turnkeyIframeClient.injectCredentialBundle(
        otpResult.credentialBundle,
      );
      if (!injectResponse) {
        throw new Error("Failed to inject credentials into Turnkey");
      }

      const turnkeyAddress = await getOrCreateWallet(
        subOrganizationId,
        username,
        turnkeyIframeClient!,
      );

      this.account = turnkeyAddress;
      this.subOrganizationId = subOrganizationId;

      return {
        success: true,
        wallet: this.type,
        account: turnkeyAddress,
      };
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent("show-sms-authentication", {
          detail: null,
        }),
      );
      console.error(error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        wallet: this.type,
      };
    } finally {
      window.removeEventListener("sms-signer-phone-number", handlePhoneNumber);
      window.removeEventListener("sms-signer-otp-code", handleOtpCode);
    }
  }
}
