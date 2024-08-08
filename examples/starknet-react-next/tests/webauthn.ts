import { CDPSession } from "@playwright/test";

export async function addVirtualAuthenticator(client: CDPSession) {
  await client.send("WebAuthn.enable");
  const {} = await client.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "ble",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });
}

export class WebauthnEmulator {
  private client: CDPSession;
  public authenticatorId?: string;

  constructor(client: CDPSession) {
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
