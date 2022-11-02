import { ec, Account, defaultProvider, KeyPair, number } from "starknet";
import { BigNumberish } from "starknet/dist/utils/number";
import { Policy, Session } from "@cartridge/controller";
import equal from "fast-deep-equal";

import Storage from "utils/storage";
import { DeviceSigner } from "./signer";

export default class Controller extends Account {
  protected publicKey: string;
  protected keypair: KeyPair;

  constructor(keypair: KeyPair, address: string) {
    super(defaultProvider, address, keypair);
    this.signer = new DeviceSigner(keypair);
    this.keypair = keypair;
    this.publicKey = ec.getStarkKey(keypair);
  }

  cache() {
    return Storage.set("controller", {
      privateKey: number.toHex(this.keypair.priv),
      publicKey: this.publicKey,
      address: this.address,
    });
  }

  delete() {
    return Storage.clear();
  }

  approve(origin: string, policies: Policy[], maxFee?: BigNumberish) {
    Storage.set(`@session/${origin}`, {
      policies,
      maxFee,
    });
  }

  revoke(origin: string) {
    Storage.remove(`@session/${origin}`);
  }

  session(origin: string): Session | undefined {
    return Storage.get(`@session/${origin}`);
  }

  sessions(): { [key: string]: Session } | undefined {
    return Storage.keys()
      .filter((k) => k.startsWith("@session/"))
      .reduce((prev, key) => {
        prev[key.slice(9)] = Storage.get(key);
        return prev;
      }, {} as { [key: string]: Session });
  }

  static fromStore() {
    const controller = Storage.get("controller");
    if (!controller) {
      return null;
    }

    const { privateKey, address } = controller;
    const keypair = ec.getKeyPair(privateKey);
    return new Controller(keypair, address);
  }
}

export function diff(a: Policy[], b: Policy[]): Policy[] {
  return a.reduce(
    (prev, policy) =>
      b.some((approval) => equal(approval, policy)) ? prev : [...prev, policy],
    [] as Policy[],
  );
}
