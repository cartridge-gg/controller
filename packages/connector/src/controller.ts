import { InjectedController, ControllerOptions } from "@cartridge/controller";
import { InjectedConnector } from "@starknet-react/core";

export default class ControllerConnector extends InjectedConnector {
  public controller: InjectedController;

  constructor(options: ControllerOptions) {
    super({
      options: {
        id: "controller",
        name: "Controller",
      },
    });

    this.controller = new InjectedController(options);
  }

  username() {
    return this.controller.username();
  }

  async delegateAccount() {
    return await this.controller.delegateAccount();
  }
}
