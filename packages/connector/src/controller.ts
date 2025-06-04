import ControllerProvider, { ControllerOptions } from "@cartridge/controller";
import { Connector, InjectedConnector } from "@starknet-react/core";

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

  isReady(): boolean {
    return this.controller.isReady();
  }

  async delegateAccount() {
    return await this.controller.delegateAccount();
  }

  static fromConnectors(connectors: Connector[]): ControllerConnector {
    const connector = connectors.find((c) => c.id === "controller");
    if (!connector) {
      throw new Error("Controller connector not found");
    }
    return connector as ControllerConnector;
  }
}
