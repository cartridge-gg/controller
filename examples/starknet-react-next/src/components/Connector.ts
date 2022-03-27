import { Connector } from "@starknet-react/core";
import { Cartridge } from "@cartridge/sdk";

export class CartridgeConnector extends Connector {
  readonly id = "cartridge";
  readonly name = "cartridge";

  private cartridge: Cartridge;

  constructor() {
    super({ options: undefined });
    this.cartridge = new Cartridge();
  }

  static ready(): boolean {
    return true;
  }

  async connect() {
    this.cartridge.connect();
    return Promise.reject(null);
  }

  account() {
    return Promise.reject(null);
  }
}
