import { CDPSession } from "@playwright/test";

export class WebauthnEmulator {
  private client: CDPSession;
  public authenticatorId?: string;

  constructor({ client }: { client: CDPSession }) {
    this.client = client;
  }

  async enable() {
    await this.client.send("WebAuthn.enable");
  }

  async addVirtualAuthenticator() {
    const { authenticatorId } = await this.client.send(
      "WebAuthn.addVirtualAuthenticator",
      {
        options: {
          protocol: "ctap2",
          transport: "ble",
          hasResidentKey: true,
          hasUserVerification: true,
          isUserVerified: true,
          automaticPresenceSimulation: true,
        },
      },
    );

    this.authenticatorId = authenticatorId;
  }

  async removeVirtualAuthenticator() {
    if (!this.authenticatorId) {
      throw new Error("No virtual authnticator found");
    }

    await this.client.send("WebAuthn.removeVirtualAuthenticator", {
      authenticatorId: this.authenticatorId,
    });
  }
}
