import SessionProvider, { SessionOptions } from "@cartridge/controller/session";
import { Connector, InjectedConnector } from "@starknet-react/core";

export default class SessionConnector extends InjectedConnector {
  public controller: SessionProvider;

  constructor(options: SessionOptions) {
    const controller = new SessionProvider(options);

    super({
      options: {
        id: controller.id,
        name: controller.name,
      },
    });

    this.controller = controller;
  }

  async disconnect() {
    await this.controller.disconnect();
    try {
      await super.disconnect();
    } catch {
      // Best-effort: disconnect should not throw if the injected wallet isn't available.
    }
  }

  static fromConnectors(connectors: Connector[]): SessionConnector {
    const connector = connectors.find((c) => c.id === "controller_session");
    if (!connector) {
      throw new Error("Session connector not found");
    }
    return connector as SessionConnector;
  }

  username() {
    return this.controller.username();
  }
}
