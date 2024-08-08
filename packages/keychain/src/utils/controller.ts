import {
  SignerInterface,
  BigNumberish,
  addAddressPadding,
  num,
} from "starknet";

import { Policy, Session } from "@cartridge/controller";

import Storage from "utils/storage";

import Account from "./account";
import { selectors, VERSION } from "./selectors";
import migrations from "./migrations";
import { AccountInfoDocument } from "generated/graphql";
import { client } from "./graphql";

type SerializedController = {
  publicKey: string;
  credentialId: string;
  address: string;
  username: string;
};

export default class Controller {
  public account: Account;
  public address: string;
  public username: string;
  public chainId: string;
  public rpcUrl: string;
  public signer: SignerInterface;
  protected publicKey: string;
  protected credentialId: string;

  constructor({
    chainId,
    rpcUrl,
    address,
    username,
    publicKey,
    credentialId,
  }: {
    chainId: string;
    rpcUrl: string;
    address: string;
    username: string;
    publicKey: string;
    credentialId: string;
  }) {
    this.address = address;
    this.username = username;
    this.chainId = chainId;
    this.rpcUrl = rpcUrl;
    this.publicKey = publicKey;
    this.credentialId = credentialId;
    this.account = new Account(
      chainId,
      rpcUrl,
      address,
      username,
      this.signer,
      {
        rpId: process.env.NEXT_PUBLIC_RP_ID,
        credentialId,
        publicKey,
      },
    );
  }

  async getUser() {
    const res = await client.request(AccountInfoDocument, {
      id: this.address,
    });

    // @ts-expect-error TODO: fix type error
    const account = res.accounts?.edges?.[0]?.node;
    if (!account) {
      throw new Error("User not found");
    }

    return {
      address: this.address,
      name: account.id,
      profileUri: `https://cartridge.gg/profile/${this.address}`,
    };
  }

  async delegateAccount() {
    const address = await this.account.cartridge.delegateAccount();
    return num.toHexString(address);
  }

  delete() {
    return Storage.clear();
  }

  async approve(
    origin: string,
    expiresAt: bigint,
    policies: Policy[],
    maxFee?: BigNumberish,
  ) {
    if (!this.account) {
      throw new Error("Account not found");
    }

    const credentials = await this.account.cartridge.createSession(
      policies,
      expiresAt,
    );

    Storage.set(
      selectors[VERSION].session(this.address, origin, this.account.chainId),
      {
        policies,
        maxFee,
        credentials,
        expiresAt: expiresAt.toString(),
      },
    );
  }

  revoke(origin: string) {
    // TODO: Cartridge Account SDK to implement revoke session tokens
    Storage.remove(
      selectors[VERSION].session(this.address, origin, this.account.chainId),
    );
  }

  session(origin: string): Session | undefined {
    return Storage.get(
      selectors[VERSION].session(this.address, origin, this.account.chainId),
    );
  }

  sessions(): { [key: string]: Session } | undefined {
    return Storage.keys()
      .filter((k) => k.startsWith(`@session/${this.address}/${origin}`))
      .reduce((prev, key) => {
        prev[key.slice(9)] = Storage.get(key);
        return prev;
      }, {} as { [key: string]: Session });
  }

  store() {
    Storage.set("version", VERSION);

    Storage.set(
      selectors[VERSION].admin(this.address, process.env.NEXT_PUBLIC_ADMIN_URL),
      {},
    );
    Storage.set(selectors[VERSION].active(), {
      address: this.address,
      rpcUrl: this.rpcUrl,
      chainId: this.chainId,
    });

    return Storage.set(selectors[VERSION].account(this.address), {
      username: this.username,
      publicKey: this.publicKey,
      credentialId: this.credentialId,
    });
  }

  updateChain(rpcUrl: string, chainId: string) {
    this.rpcUrl = rpcUrl;
    this.chainId = chainId;

    Storage.set(selectors[VERSION].active(), {
      address: this.address,
      rpcUrl,
      chainId,
    });
  }

  static fromStore() {
    try {
      const version = Storage.get("version");
      if (!version) {
        return;
      }

      let controller: SerializedController;
      const { address, chainId, rpcUrl } = Storage.get(
        selectors[VERSION].active(),
      );
      controller = Storage.get(selectors[VERSION].account(address));
      if (!controller) {
        return;
      }

      const { username, publicKey, credentialId } = controller;

      if (version !== VERSION) {
        migrations[version][VERSION](address);
      }

      return new Controller({
        chainId,
        rpcUrl,
        address,
        username,
        publicKey,
        credentialId,
      });
    } catch (e) {
      // If the current storage is incompatible, clear it so it gets recreated.
      Storage.clear();
      return;
    }
  }
}

export function diff(a: Policy[], b: Policy[]): Policy[] {
  return a.reduce(
    (prev, policy) =>
      b.some(
        (approval) =>
          addAddressPadding(approval.target) ===
            addAddressPadding(policy.target) &&
          approval.method === policy.method,
      )
        ? prev
        : [...prev, policy],
    [] as Policy[],
  );
}
