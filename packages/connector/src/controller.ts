import ControllerProvider, {
  ConnectOptions,
  ControllerOptions,
} from "@cartridge/controller";
import type { UseConnectResult } from "@starknet-start/react";

type StarknetStartConnector = UseConnectResult["connectors"][number];

export default class ControllerConnector {
  private static current?: ControllerConnector;

  public controller: ControllerProvider;

  constructor(options: ControllerOptions = {}) {
    const controllerWindow =
      typeof window === "undefined"
        ? undefined
        : (window as unknown as {
            starknet_controller?: ControllerProvider;
          });
    if (controllerWindow?.starknet_controller) {
      console.warn(
        "ControllerConnector was instantiated multiple times. " +
          "Reusing existing controller to prevent errors. " +
          "To fix, create the connector at the module level instead of inside a React component.",
      );
      this.controller = controllerWindow.starknet_controller;
    } else {
      this.controller = new ControllerProvider(options);
    }

    ControllerConnector.current = this;
  }

  get id() {
    return this.controller.id;
  }

  get name() {
    return this.controller.name;
  }

  async disconnect() {
    await this.controller.disconnect();
  }

  username() {
    return this.controller.username();
  }

  credits() {
    return this.controller.credits();
  }

  lookupUsername(username: string) {
    return this.controller.lookupUsername(username);
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

    return { account: account.address, chainId: chainIdHint };
  }

  static walletFromConnectors(
    connectors: StarknetStartConnector[],
  ): StarknetStartConnector {
    const connector = connectors.find(
      (candidate) => candidate.name === "Controller",
    );
    if (!connector) {
      throw new Error("Controller connector not found");
    }
    return connector;
  }

  static fromConnectors(
    connectors: StarknetStartConnector[],
  ): ControllerConnector {
    ControllerConnector.walletFromConnectors(connectors);
    if (!ControllerConnector.current) {
      throw new Error("ControllerConnector has not been instantiated");
    }
    return ControllerConnector.current;
  }

  asWalletStandard() {
    return this.controller.asWalletStandard();
  }
}
