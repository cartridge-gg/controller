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
    this.controller.disconnect();
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
