import { Connector } from "@starknet-react/core";
import Controller, { Policy } from "@cartridge/controller";
import { AccountInterface, InvokeFunctionResponse, constants } from "starknet";

class ControllerConnector extends Connector {
  public controller: Controller;
  private _account: AccountInterface | null;

  constructor(
    policies?: Policy[],
    options?: {
      url?: string;
      origin?: string;
      chainId?: constants.StarknetChainId;
    },
  ) {
    super();
    this._account = null;
    this.controller = new Controller(policies, options);
  }

  readonly id = "cartridge";

  readonly name = "Cartridge";

  // TODO(#244): Set controller icon
  readonly icon = {
    dark: "",
    light: "",
  };

  async chainId() {
    const val = await this.controller.account.getChainId();
    return Promise.resolve(BigInt(val));
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

  async connect() {
    const account = await this.controller.connect();

    if (!account) {
      throw new Error("account not found");
    }
    const chainId = await this.chainId();

    this._account = account;

    return {
      account: this._account.address,
      chainId,
    };
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
}

export default ControllerConnector;
