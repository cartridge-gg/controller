import {
  constants,
  ec,
  KeyPair,
  hash,
  number,
  transaction,
  Call,
  Invocation,
  InvocationsDetails,
  SignerInterface,
  stark,
} from "starknet";
import equal from "fast-deep-equal";

import { Policy, Session } from "@cartridge/controller";

import Storage from "utils/storage";

import Account from "./account";
import { DeviceSigner } from "./signer";
import WebauthnAccount, { RawAssertion } from "./webauthn";
import selectors from "./selectors";
import migrations from "./migrations";
import { AccountInfoDocument } from "generated/graphql";
import { client } from "./graphql";

export const VERSION = "0.0.3";

export type InvocationWithDetails = {
  invocation: Invocation;
  details: InvocationsDetails;
};

export type RegisterData = {
  assertion: RawAssertion;
  invoke: InvocationWithDetails;
};

type SerializedController = {
  credentialId: string;
  privateKey: string;
  publicKey: string;
  address: string;
};

enum SupportedChainIds {
  MAINNET = "0x534e5f4d41494e",
  TESTNET = "0x534e5f474f45524c49",
}

export default class Controller {
  public address: string;
  public signer: SignerInterface;
  public publicKey: string;
  protected keypair: KeyPair;
  protected credentialId: string;
  protected accounts: { [key in SupportedChainIds]: Account };

  constructor(
    keypair: KeyPair,
    address: string,
    credentialId: string,
    options?: {
      rpId?: string;
    },
  ) {
    this.address = address;
    this.signer = new DeviceSigner(keypair);
    this.keypair = keypair;
    this.publicKey = ec.getStarkKey(keypair);
    this.credentialId = credentialId;

    this.accounts = {
      [constants.StarknetChainId.TESTNET]: new Account(
        constants.StarknetChainId.TESTNET,
        process.env.NEXT_PUBLIC_RPC_GOERLI,
        address,
        this.signer,
        new WebauthnAccount(
          process.env.NEXT_PUBLIC_RPC_GOERLI,
          address,
          credentialId,
          this.publicKey,
          options,
        ),
      ),
      [constants.StarknetChainId.MAINNET]: new Account(
        constants.StarknetChainId.MAINNET,
        process.env.NEXT_PUBLIC_RPC_MAINNET,
        address,
        this.signer,
        new WebauthnAccount(
          process.env.NEXT_PUBLIC_RPC_MAINNET,
          address,
          credentialId,
          this.publicKey,
          options,
        ),
      ),
    };

    this.approve(process.env.NEXT_PUBLIC_ADMIN_URL, [], "0");
    Storage.set(
      selectors[VERSION].admin(this.address, process.env.NEXT_PUBLIC_ADMIN_URL),
      {},
    );
    Storage.set(selectors["0.0.3"].active(), address);
    this.store();
  }

  async getUser() {
    const res = await client.request(AccountInfoDocument, {
      id: this.address,
    });

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

  account(chainId: constants.StarknetChainId) {
    return this.accounts[chainId];
  }

  delete() {
    return Storage.clear();
  }

  approve(origin: string, policies: Policy[], maxFee?: number.BigNumberish) {
    Storage.set(selectors[VERSION].session(this.address, origin), {
      policies,
      maxFee,
    });
  }

  revoke(origin: string) {
    Storage.remove(selectors[VERSION].session(this.address, origin));
  }

  session(origin: string): Session | undefined {
    return Storage.get(selectors[VERSION].session(this.address, origin));
  }

  sessions(): { [key: string]: Session } | undefined {
    return Storage.keys()
      .filter((k) => k.startsWith(selectors[VERSION].session(this.address, "")))
      .reduce((prev, key) => {
        prev[key.slice(9)] = Storage.get(key);
        return prev;
      }, {} as { [key: string]: Session });
  }

  store() {
    Storage.set("version", VERSION);
    return Storage.set(selectors[VERSION].account(this.address), {
      privateKey: number.toHex(this.keypair.priv),
      publicKey: this.publicKey,
      address: this.address,
      credentialId: this.credentialId,
    });
  }

  static fromStore() {
    const version = Storage.get("version");
    if (!version) {
      return;
    }

    let controller: SerializedController;
    if (version === "0.0.2") {
      controller = Storage.get(selectors["0.0.2"].account());
    } else if (version === "0.0.3") {
      const active = Storage.get(selectors["0.0.3"].active());
      controller = Storage.get(selectors["0.0.3"].account(active));
    }

    if (!controller) {
      return;
    }

    const { credentialId, privateKey, address } = controller;

    if (version !== VERSION) {
      migrations[version][VERSION](address);
    }

    const keypair = ec.getKeyPair(privateKey);
    return new Controller(keypair, address, credentialId);
  }
}

export function diff(a: Policy[], b: Policy[]): Policy[] {
  return a.reduce(
    (prev, policy) =>
      b.some((approval) => equal(approval, policy)) ? prev : [...prev, policy],
    [] as Policy[],
  );
}
