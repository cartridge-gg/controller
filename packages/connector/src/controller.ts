import ControllerProvider, {
  AuthOptions,
  ControllerOptions,
} from "@cartridge/controller";
import { Connector, InjectedConnector } from "@starknet-react/core";

import { StarknetInjectedWallet } from "@starknet-io/get-starknet-wallet-standard";
import type { WalletWithStarknetFeatures } from "@starknet-io/get-starknet-wallet-standard/features";

export default class ControllerConnector extends InjectedConnector {
  public controller: ControllerProvider;

  constructor(options: ControllerOptions = {}) {
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

  async connect(args?: { chainIdHint?: bigint; signupOptions?: AuthOptions }) {
    await this.controller.connect(args?.signupOptions);
    return super.connect({ chainIdHint: args?.chainIdHint });
  }

  static fromConnectors(connectors: Connector[]): ControllerConnector {
    const connector = connectors.find((c) => c.id === "controller");
    if (!connector) {
      throw new Error("Controller connector not found");
    }
    return connector as ControllerConnector;
  }

  asWalletStandard(): WalletWithStarknetFeatures {
    if (typeof window !== "undefined") {
      console.warn(
        `Casting Controller to WalletWithStarknetFeatures is an experimental feature and may contain bugs. ` +
          `Please report any issues at https://github.com/cartridge-gg/controller/issues`,
      );
    }

    return new StarknetInjectedWallet(this.controller);
  }
}
