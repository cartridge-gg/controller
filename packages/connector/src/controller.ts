import ControllerProvider, { ControllerOptions } from "@cartridge/controller";
import { InjectedConnector } from "@starknet-react/core";

export default class ControllerConnector extends InjectedConnector {
  public controller: ControllerProvider;

  constructor(options: ControllerOptions) {
    const controller = new ControllerProvider(options);

    super({
      options: {
        id: controller.id,
        name: controller.name,
      },
    });

    this.controller = controller;
  }

  async disconnect() {
    this.controller.disconnect();
  }

  username() {
    return this.controller.username();
  }

  async delegateAccount() {
    return await this.controller.delegateAccount();
  }
}
