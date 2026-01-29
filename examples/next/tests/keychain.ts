import { FrameLocator } from "@playwright/test";
import { Page } from "@playwright/test";
import { randomUUID } from "crypto";

export class Keychain {
  private page: Page;
  private modal: FrameLocator;
  public username: string;

  constructor({ page, username }: { page: Page; username?: string }) {
    this.page = page;
    this.modal = page.frameLocator("#controller-keychain");
    this.username = username ?? this.randomUsername();
  }

  async signup() {
    await this.connect();
    const usernameInput = this.modal.getByPlaceholder("Username");
    await usernameInput.fill(this.username);
    await usernameInput.press("Escape");
    await this.modal.getByRole("button", { name: "SIGN UP" }).click();
    const passkeyOption = this.modal.getByRole("button", { name: "PASSKEY" });
    if ((await passkeyOption.count()) > 0) {
      await passkeyOption.click();
    }
  }

  async session() {
    const continueButton = this.modal.getByRole("button", {
      name: /continue/i,
    });
    const createSessionButton = this.modal.getByRole("button", {
      name: "CREATE SESSION",
    });

    await Promise.race([
      continueButton.waitFor({ state: "visible", timeout: 3000 }),
      createSessionButton.waitFor({ state: "visible", timeout: 3000 }),
    ]).catch(() => {});

    if ((await continueButton.count()) > 0) {
      if (await continueButton.isDisabled()) {
        const consentText = this.modal.getByText(
          "I agree to grant this application permission to execute the actions listed above.",
        );
        if ((await consentText.count()) > 0) {
          await consentText.click();
        }
      }
      await continueButton.click();
      const confirmButton = this.modal.getByRole("button", { name: "Confirm" });
      try {
        await confirmButton.waitFor({ state: "visible", timeout: 5000 });
        await confirmButton.click();
      } catch {
        // No spending limit confirmation step.
      }
      return;
    }

    if ((await createSessionButton.count()) > 0) {
      await createSessionButton.click();
    }
  }

  async login() {
    await this.connect();
    const usernameInput = this.modal.getByPlaceholder("Username");
    await usernameInput.fill(this.username);
    await usernameInput.press("Escape");
    await this.modal.getByRole("button", { name: "LOG IN" }).click();
    const passkeyOption = this.modal.getByRole("button", { name: "PASSKEY" });
    if ((await passkeyOption.count()) > 0) {
      await passkeyOption.click();
    }
  }

  disconnect() {
    const disconnectItem = this.page.getByText("Disconnect");
    const profileButton = this.page.getByRole("button", {
      name: /0x[a-fA-F0-9]+/,
    });
    return profileButton
      .first()
      .waitFor({ state: "visible", timeout: 10000 })
      .then(async () => {
        await profileButton.first().click();
        await disconnectItem.waitFor({ state: "visible", timeout: 5000 });
        await disconnectItem.click();
      });
  }

  private connect() {
    return this.page.getByRole("button", { name: "Connect" }).click();
  }

  private randomUsername() {
    return `test-${randomUUID().slice(0, 8)}`;
  }
}
