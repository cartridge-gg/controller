import ControllerProvider, {
  ConnectOptions,
  ControllerOptions,
} from "@cartridge/controller";
import { Connector, InjectedConnector } from "@starknet-react/core";

export default class ControllerConnector extends InjectedConnector {
  public controller: ControllerProvider;

  constructor(options: ControllerOptions = {}) {
    let controller: ControllerProvider;

    if (typeof window !== "undefined" && (window as any).starknet_controller) {
      console.warn(
        "ControllerConnector was instantiated multiple times. " +
          "Reusing existing controller to prevent errors. " +
          "To fix, create the connector at the module level instead of inside a React component.",
      );
      controller = (window as any).starknet_controller;
    } else {
      controller = new ControllerProvider(options);
    }

    super({ options: { id: controller.id, name: controller.name } });
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

  async connect(args?: { chainIdHint?: bigint } & ConnectOptions) {
    const { chainIdHint, ...connectOptions } = args ?? {};
    const controllerArgs =
      args && Object.keys(connectOptions).length > 0
        ? (connectOptions as ConnectOptions)
        : undefined;

    const account = await this.controller.connect(controllerArgs);
    if (!account) {
      throw new Error("Failed to connect controller");
    }
    return super.connect({ chainIdHint });
  }

  static fromConnectors(connectors: Connector[]): ControllerConnector {
    const connector = connectors.find((c) => c.id === "controller");
    if (!connector) {
      throw new Error("Controller connector not found");
    }
    return connector as ControllerConnector;
  }

  asWalletStandard() {
    return this.controller.asWalletStandard();
  }
}
