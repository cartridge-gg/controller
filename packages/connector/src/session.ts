import SessionProvider, { SessionOptions } from "@cartridge/controller/session";
import type { UseConnectResult } from "@starknet-start/react";

type StarknetStartConnector = UseConnectResult["connectors"][number];

export default class SessionConnector {
  private static current?: SessionConnector;

  public controller: SessionProvider;

  constructor(options: SessionOptions) {
    this.controller = new SessionProvider(options);
    SessionConnector.current = this;
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

  static walletFromConnectors(
    connectors: StarknetStartConnector[],
  ): StarknetStartConnector {
    const connector = connectors.find(
      (candidate) => candidate.name === "Controller Session",
    );
    if (!connector) {
      throw new Error("Session connector not found");
    }
    return connector;
  }

  static fromConnectors(
    connectors: StarknetStartConnector[],
  ): SessionConnector {
    SessionConnector.walletFromConnectors(connectors);
    if (!SessionConnector.current) {
      throw new Error("SessionConnector has not been instantiated");
    }
    return SessionConnector.current;
  }

  username() {
    return this.controller.username();
  }
}
