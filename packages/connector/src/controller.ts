import ControllerProvider, {
  ConnectOptions,
  Controller,
  ControllerOptions,
  init,
  InitOptions,
} from "@cartridge/controller";
import { Connector, InjectedConnector } from "@starknet-react/core";

export interface ControllerConnectorOptions extends ControllerOptions {
  /** When true, load the controller logic from the remote SDK (x.cartridge.gg/sdk.js)
   *  instead of bundling it in the client application. */
  useRemoteSDK?: boolean;
}

export default class ControllerConnector extends InjectedConnector {
  public controller: ControllerProvider | Controller;
  private _initPromise?: Promise<Controller>;

  constructor(options: ControllerConnectorOptions = {}) {
    super({ options: { id: "controller", name: "Controller" } });

    let controller: ControllerProvider | Controller | undefined;

    if (typeof window !== "undefined" && (window as any).starknet_controller) {
      console.warn(
        "ControllerConnector was instantiated multiple times. " +
          "Reusing existing controller to prevent errors. " +
          "To fix, create the connector at the module level instead of inside a React component.",
      );
      controller = (window as any).starknet_controller;
    } else if (options.useRemoteSDK) {
      // Defer heavy initialization to remote SDK — controller will be set on first ensureController()
      this._initPromise = init(options as InitOptions);
    } else {
      controller = new ControllerProvider(options);
    }

    // When using remote SDK, controller starts as undefined and is set lazily
    this.controller = controller!;
  }

  private async ensureController(): Promise<ControllerProvider | Controller> {
    if (this._initPromise) {
      this.controller = await this._initPromise;
      this._initPromise = undefined;
      if (typeof window !== "undefined") {
        (window as any).starknet_controller = this.controller;
      }
    }
    return this.controller;
  }

  async disconnect() {
    const controller = await this.ensureController();
    await controller.disconnect();
    try {
      await super.disconnect();
    } catch {
      // Best-effort: starknet-react may call disconnect even when the injected wallet isn't present.
    }
  }

  username() {
    return this.controller?.username();
  }

  lookupUsername(username: string) {
    return this.controller?.lookupUsername(username);
  }

  isReady(): boolean {
    return this.controller?.isReady() ?? false;
  }

  async delegateAccount() {
    const controller = await this.ensureController();
    return await controller.delegateAccount();
  }

  async connect(args?: { chainIdHint?: bigint } & ConnectOptions) {
    const controller = await this.ensureController();

    const { chainIdHint, ...connectOptions } = args ?? {};
    const controllerArgs =
      args && Object.keys(connectOptions).length > 0
        ? (connectOptions as ConnectOptions)
        : undefined;

    const account = await controller.connect(controllerArgs);
    if (!account) {
      throw new Error("Failed to connect controller");
    }

    // Ensure the injected wallet instance used by starknet-react (window.starknet_controller)
    // always points at the same controller instance this connector wraps.
    if (typeof window !== "undefined") {
      (window as any).starknet_controller = this.controller;
    }

    const data = await super.connect({ chainIdHint });

    // `@starknet-react/core` updates its state from the `account` returned here.
    // Use the authoritative address from `controller.connect()` to avoid edge cases
    // where the injected wallet request returns an empty/undefined account.
    return { ...data, account: account.address };
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
