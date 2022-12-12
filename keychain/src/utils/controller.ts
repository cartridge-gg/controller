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
import { CONTROLLER_CLASS } from "./constants";
import { DeviceSigner } from "./signer";
import WebauthnAccount, { formatAssertion, RawAssertion } from "./webauthn";
import { getGasPrice } from "./gateway";
import selectors from "./selectors";
import migrations from "./migrations";

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
  credentialId: string,
  privateKey: string,
  publicKey: string,
  address: string,
};

export default class Controller {
  public address: string;
  public signer: SignerInterface;
  protected publicKey: string;
  protected keypair: KeyPair;
  protected credentialId: string;
  protected webauthn: { [key in constants.StarknetChainId]: WebauthnAccount };
  protected accounts: { [key in constants.StarknetChainId]: Account };

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
      ),
      [constants.StarknetChainId.TESTNET2]: new Account(
        constants.StarknetChainId.TESTNET2,
        process.env.NEXT_PUBLIC_RPC_GOERLI,
        address,
        this.signer,
      ),
      [constants.StarknetChainId.MAINNET]: new Account(
        constants.StarknetChainId.MAINNET,
        process.env.NEXT_PUBLIC_RPC_MAINNET,
        address,
        this.signer,
      ),
    };

    this.webauthn = {
      [constants.StarknetChainId.TESTNET]: new WebauthnAccount(
        process.env.NEXT_PUBLIC_RPC_GOERLI,
        address,
        credentialId,
        this.publicKey,
        options,
      ),
      [constants.StarknetChainId.TESTNET2]: new WebauthnAccount(
        process.env.NEXT_PUBLIC_RPC_GOERLI,
        address,
        credentialId,
        this.publicKey,
        options,
      ),
      [constants.StarknetChainId.MAINNET]: new WebauthnAccount(
        process.env.NEXT_PUBLIC_RPC_MAINNET,
        address,
        credentialId,
        this.publicKey,
        options,
      ),
    };

    this.approve(process.env.NEXT_PUBLIC_ADMIN_URL, [], "0");
    Storage.set(
      selectors[VERSION].admin(this.address, process.env.NEXT_PUBLIC_ADMIN_URL),
      {},
    );
    this.store();
  }

  account(chainId: constants.StarknetChainId) {
    return this.accounts[chainId];
  }

  async signAddDeviceKey(
    chainId: constants.StarknetChainId,
  ): Promise<RegisterData> {
    const calls: Call[] = [
      {
        contractAddress: this.address,
        entrypoint: "executeOnPlugin",
        calldata: [
          CONTROLLER_CLASS,
          hash.getSelector("add_device_key"),
          1,
          this.publicKey,
        ],
      },
    ];

    const nonce = await this.accounts[chainId].getNonce();
    const version = number.toBN(hash.transactionVersion);
    const calldata = transaction.fromCallsToExecuteCalldata(calls);

    const gas = 28000;
    const gasPrice = await getGasPrice(chainId);
    const fee = number.toBN(gasPrice).mul(number.toBN(gas));
    const suggestedMaxFee = stark.estimatedFeeToMaxFee(fee);

    let msgHash = hash.calculateTransactionHash(
      this.address,
      version,
      calldata,
      suggestedMaxFee,
      chainId,
      nonce,
    );

    let challenge = Uint8Array.from(
      msgHash
        .slice(2)
        .padStart(64, "0")
        .slice(0, 64)
        .match(/.{1,2}/g)
        .map((byte) => parseInt(byte, 16)),
    );
    const assertion = await this.webauthn[chainId].signer.sign(challenge);
    const signature = formatAssertion(assertion);
    return {
      assertion,
      invoke: {
        invocation: { contractAddress: this.address, calldata, signature },
        details: {
          nonce,
          maxFee: suggestedMaxFee,
          version,
        },
      },
    };
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
