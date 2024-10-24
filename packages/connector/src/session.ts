import SessionProvider, { SessionOptions } from "@cartridge/controller/session";
import { InjectedConnector } from "@starknet-react/core";

export default class ControllerConnector extends InjectedConnector {
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
}
