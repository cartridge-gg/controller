import { Connector, EventHandler } from "@starknet-react/core";
import Controller, {
  Assertion,
  Policy,
  SupportedChainIds,
} from "@cartridge/controller";
import { AccountInterface, InvokeFunctionResponse } from "starknet";

class ControllerConnector extends Connector {
  public controller: Controller;
  private _account: AccountInterface | null;

  constructor(
    policies?: Policy[],
    options?: {
      url?: string;
      origin?: string;
      chainId?: SupportedChainIds;
    },
  ) {
    super({ options });
    this._account = null;
    this.controller = new Controller(policies, options);
  }

  id() {
    return "cartridge";
  }

  name() {
    return "Cartridge";
  }

  available(): boolean {
    return true;
  }

  async ready() {
    return await this.controller.ready();
  }

  async register(
    username: string,
    credentialId: string,
    credential: { x: string; y: string },
  ) {
    return this.controller.register(username, credentialId, credential);
  }

  async login(
    address: string,
    credentialId: string,
    options: {
      rpId?: string;
      challengeExt?: Buffer;
    },
  ): Promise<{ assertion: Assertion } | null> {
    return this.controller.login(address, credentialId, options);
  }

  async provision(address: string, credentialId: string) {
    return this.controller.provision(address, credentialId);
  }

  async connect(): Promise<AccountInterface> {
    const account = await this.controller.connect();

    if (!account) {
      throw new Error("account not found");
    }

    this._account = account;
    return this._account;
  }

  async disconnect(): Promise<void> {
    return this.controller.disconnect();
  }

  account() {
    return Promise.resolve(this._account);
  }

  async issueStarterPack(id: string): Promise<InvokeFunctionResponse> {
    return this.controller.issueStarterPack(id);
  }

  async showQuests(gameId: string): Promise<void> {
    return this.controller.showQuests(gameId);
  }

  initEventListener(accountChangeCb: EventHandler): Promise<void> {
    // TODO
    return Promise.resolve();
  }

  removeEventListener(accountChangeCb: EventHandler): Promise<void> {
    // TODO
    return Promise.resolve();
  }
}

export default ControllerConnector;
