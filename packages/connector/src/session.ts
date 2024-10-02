import { Connector } from "@starknet-react/core";
import { Policy } from "@cartridge/controller";
import { icon } from "./icon";
import { AccountInterface } from "starknet";
import SessionAccount from "@cartridge/controller/dist/session";

class SessionConnector extends Connector {
  public address: string;
  private _chainId: string;
  public controller: SessionAccount & AccountInterface;

  constructor({
    rpcUrl,
    privateKey,
    address,
    ownerGuid,
    chainId,
    expiresAt,
    policies,
  }: {
    rpcUrl: string;
    privateKey: string;
    address: string;
    ownerGuid: string;
    chainId: string;
    expiresAt: number;
    policies: Policy[];
  }) {
    super();

    this.address = address;
    this._chainId = chainId;
    this.controller = new SessionAccount({
      rpcUrl,
      privateKey,
      address,
      ownerGuid,
      chainId,
      expiresAt,
      policies,
    });
  }

  readonly id = "controller";

  readonly name = "Controller";

  readonly icon = {
    dark: icon,
    light: icon,
  };

  async chainId() {
    return Promise.resolve(BigInt(this._chainId));
  }

  available(): boolean {
    return true;
  }

  ready(): Promise<boolean> {
    return Promise.resolve(true);
  }

  async connect() {
    return {
      account: this.address,
      chainId: await this.chainId(),
    };
  }

  disconnect(): Promise<void> {
    return Promise.resolve();
  }

  account() {
    return Promise.resolve(this.controller);
  }
}

export default SessionConnector;
