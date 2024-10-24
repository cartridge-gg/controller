import { Connector } from "@starknet-react/core";
import Controller, { ControllerOptions } from "@cartridge/controller";
import { AccountInterface } from "starknet";
import { icon } from "./icon";

export default class ControllerConnector extends Connector {
  public controller: Controller;
  private _account: AccountInterface | undefined;

  constructor(options?: ControllerOptions) {
    super();
    this.controller = new Controller(options);
  }

  readonly id = "controller";

  readonly name = "Controller";

  readonly icon = {
    dark: icon,
    light: icon,
  };

  async chainId() {
    if (!this._account) {
      return Promise.reject("Account is not connected");
    }
    const val = await this._account.getChainId();
    return Promise.resolve(BigInt(val));
  }

  available(): boolean {
    return true;
  }

  ready() {
    return this.controller.ready();
  }

  async connect() {
    this._account = await this.controller.connect();

    if (!this._account) {
      return Promise.reject("account not found");
    }

    return {
      account: this._account.address,
      chainId: await this.chainId(),
    };
  }

  disconnect(): Promise<void> {
    return this.controller.disconnect();
  }

  account() {
    if (!this._account) {
      return Promise.reject("account not found");
    }
    return Promise.resolve(this._account);
  }

  username() {
    return this.controller.username();
  }

  async delegateAccount() {
    return await this.controller.delegateAccount();
  }

  /**
   * @deprecated Use controller.openSettings() instead.
   */
  async openMenu() {
    console.warn(
      "openMenu() is deprecated. Please use controller.openSettings() instead.",
    );
    return await this.controller.openSettings();
  }
}
