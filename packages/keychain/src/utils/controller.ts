import { constants, SignerInterface, BigNumberish } from "starknet";
import equal from "fast-deep-equal";

import { Policy, Session } from "@cartridge/controller";

import Storage from "utils/storage";

import Account from "./account";
import { CartridgeAccount } from "@cartridge/account-wasm";
import selectors from "./selectors";
import migrations from "./migrations";
import { AccountInfoDocument } from "generated/graphql";
import { client } from "./graphql";

export const VERSION = "0.0.1";

type SerializedController = {
  publicKey: string;
  credentialId: string;
  address: string;
};

export default class Controller {
  public address: string;
  public signer: SignerInterface;
  protected publicKey: string;
  protected credentialId: string;
  protected accounts: Account[];

  constructor(
    address: string,
    publicKey: string,
    credentialId: string,
    options?: {
      rpId?: string;
      origin?: string;
    },
  ) {
    this.address = address;
    this.publicKey = publicKey;
    this.credentialId = credentialId;
    this.accounts = [
      // TODO: Enable once controller is ready for mainnet
      // [constants.StarknetChainId.SN_MAIN]: new Account(
      //   constants.StarknetChainId.SN_MAIN,
      //   process.env.NEXT_PUBLIC_RPC_MAINNET,
      //   address,
      //   this.signer,
      //   new CartridgeAccount(
      //     process.env.NEXT_PUBLIC_RPC_MAINNET,
      //     address,
      //     credentialId,
      //     this.publicKey,
      //     options,
      //   ),
      // ),
      new Account(
        constants.StarknetChainId.SN_SEPOLIA,
        process.env.NEXT_PUBLIC_RPC_SEPOLIA,
        address,
        this.signer,
        CartridgeAccount.new(
          process.env.NEXT_PUBLIC_RPC_SEPOLIA,
          constants.StarknetChainId.SN_SEPOLIA,
          address,
          options?.rpId || process.env.NEXT_PUBLIC_RP_ID,
          options?.origin || process.env.NEXT_PUBLIC_ORIGIN,
          credentialId,
          publicKey,
          this.session(
            "http://localhost:3002",
            constants.StarknetChainId.SN_SEPOLIA,
          ),
        ),
      ),
    ];

    Storage.set(
      selectors[VERSION].admin(this.address, process.env.NEXT_PUBLIC_ADMIN_URL),
      {},
    );
    Storage.set(selectors["0.0.1"].active(), address);
    this.store();
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

  account(chainId: constants.StarknetChainId): Account | undefined {
    return this.accounts.find((a) => a.chainId === chainId);
  }

  delete() {
    return Storage.clear();
  }

  async approve(
    origin: string,
    chainId: constants.StarknetChainId,
    expiresAt: bigint,
    policies: Policy[],
    maxFee?: BigNumberish,
  ) {
    const account = this.account(chainId);
    if (!account) {
      throw new Error("Account not found");
    }

    const credentials = await account.cartridge.createSession(
      policies,
      expiresAt,
    );

    Storage.set(selectors[VERSION].session(this.address, origin, chainId), {
      policies,
      maxFee,
      credentials,
      expiresAt: expiresAt.toString(),
    });
  }

  revoke(origin: string, chainId: constants.StarknetChainId) {
    // TODO: Cartridge Account SDK to implement revoke session tokens
    Storage.remove(selectors[VERSION].session(this.address, origin, chainId));
  }

  session(
    origin: string,
    chainId: constants.StarknetChainId,
  ): Session | undefined {
    return Storage.get(
      selectors[VERSION].session(this.address, origin, chainId),
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
    return Storage.set(selectors[VERSION].account(this.address), {
      address: this.address,
      publicKey: this.publicKey,
      credentialId: this.credentialId,
    });
  }

  static fromStore() {
    const version = Storage.get("version");
    if (!version) {
      return;
    }

    let controller: SerializedController;
    if (version === "0.0.1") {
      const active = Storage.get(selectors["0.0.1"].active());
      controller = Storage.get(selectors["0.0.1"].account(active));
    }

    if (!controller) {
      return;
    }

    const { publicKey, credentialId, address } = controller;

    if (version !== VERSION) {
      migrations[version][VERSION](address);
    }

    return new Controller(address, publicKey, credentialId);
  }
}

export function diff(a: Policy[], b: Policy[]): Policy[] {
  return a.reduce(
    (prev, policy) =>
      b.some((approval) => equal(approval, policy)) ? prev : [...prev, policy],
    [] as Policy[],
  );
}
