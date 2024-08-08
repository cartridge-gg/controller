import { FrameLocator } from "@playwright/test";
import { Page } from "@playwright/test";

export class Keychain {
  private page: Page;
  private modal: FrameLocator;
  public username: string;

  constructor({ page, username }: { page: Page; username?: string }) {
    this.page = page;
    this.modal = page.frameLocator("#cartridge-modal");
    this.username = username ?? this.randomUsername();
  }

  async signup() {
    await this.connect();
    await this.modal.getByPlaceholder("Username").fill(this.username);
    await this.modal.getByText("SIGN UP").click();
  }

  async session() {
    await this.modal.getByRole("button", { name: "CREATE SESSION" }).click();
  }

  async login() {
    await this.connect();
    await this.modal.getByText("Log In").click();
    await this.modal.getByPlaceholder("Username").fill(this.username);
    await this.modal.getByText("LOG IN").click();
  }

  disconnect() {
    return this.page.getByText("Disconnect").click();
  }

  private connect() {
    return this.page.getByText("Connect").click();
  }

  private randomUsername() {
    return `test-${Math.random().toString().slice(2, -1)}`;
  }
}
