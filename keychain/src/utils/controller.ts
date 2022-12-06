import { ec, Account, KeyPair, number, RpcProvider, Provider, Call, Invocation, InvocationsDetails, SignerInterface } from "starknet";
import { BigNumberish } from "starknet/dist/utils/number";
import { Policy, Session } from "@cartridge/controller";
import equal from "fast-deep-equal";

import Storage from "utils/storage";
import { DeviceSigner } from "./signer";
import { StarknetChainId } from "starknet/constants";
import WebauthnAccount, { formatAssertion, RawAssertion } from "./webauthn";
import { CONTROLLER_CLASS } from "./constants";
import { calculateTransactionHash, getSelector, transactionVersion } from "starknet/utils/hash";
import { toBN } from "starknet/utils/number";
import { fromCallsToExecuteCalldata } from "starknet/utils/transaction";

const VERSION = "0.0.1"

export type InvocationWithDetails = {
  invocation: Invocation, details: InvocationsDetails
}

export type RegisterData = {
  assertion: RawAssertion;
  invoke: InvocationWithDetails;
}

export default class Controller {
  public address: string;
  public signer: SignerInterface;
  protected publicKey: string;
  protected keypair: KeyPair;
  protected webauthn: WebauthnAccount;
  protected credentialId: string;
  protected accounts: { [key in StarknetChainId]: Account }

  constructor(keypair: KeyPair, address: string, credentialId: string, options?: {
    rpId?: string;
  }) {
    this.address = address;
    this.signer = new DeviceSigner(keypair);
    this.keypair = keypair;
    this.publicKey = ec.getStarkKey(keypair);
    this.credentialId = credentialId;

    const goerli = new RpcProvider({ nodeUrl: process.env.NEXT_PUBLIC_RPC_GOERLI })
    this.accounts[StarknetChainId.TESTNET] = new Account(goerli, address, keypair);

    const mainnet = new RpcProvider({ nodeUrl: process.env.NEXT_PUBLIC_RPC_MAINNET })
    this.accounts[StarknetChainId.MAINNET] = new Account(mainnet, address, keypair);

    this.webauthn = new WebauthnAccount(
      address,
      credentialId,
      this.publicKey,
      options,
    );

    this.approve(process.env.NEXT_PUBLIC_ADMIN_URL, [], "0");
    Storage.set(`@admin/${process.env.NEXT_PUBLIC_ADMIN_URL}`, {});
    this.store();
  }

  isRegistered(chainId: StarknetChainId) {
    const register = Storage.get(`@register/${chainId}/set_device_key`)
    return register === true;
  }

  account(chainId: StarknetChainId) {
    return this.accounts[chainId];
  }

  async signAddDeviceKey(chainId: StarknetChainId): Promise<RegisterData> {
    const calls: Call[] = [
      {
        contractAddress: this.address,
        entrypoint: "executeOnPlugin",
        calldata: [
          CONTROLLER_CLASS,
          getSelector("add_device_key"),
          1,
          this.publicKey,
        ],
      },
    ];

    const nonce = await this.accounts[chainId].getNonce();
    const version = toBN(transactionVersion);
    const calldata = fromCallsToExecuteCalldata(calls);

    const suggestedMaxFee = toBN(1000000);

    let msgHash = calculateTransactionHash(
      this.address,
      version,
      calldata,
      suggestedMaxFee,
      chainId,
      nonce,
    );

    let challenge = Uint8Array.from(msgHash.slice(2).padStart(64, "0").slice(0, 64).match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
    const assertion = await this.webauthn.signer.sign(challenge);
    const signature = formatAssertion(assertion);
    return {
      assertion, invoke: {
        invocation: { contractAddress: this.address, calldata, signature },
        details: {
          nonce,
          maxFee: suggestedMaxFee,
          version,
        }
      }
    }
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

  store() {
    Storage.set("version", VERSION);
    return Storage.set("controller", {
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

    const controller = Storage.get("controller");
    if (!controller) {
      return null;
    }

    const { credentialId, privateKey, address } = controller;
    const keypair = ec.getKeyPair(privateKey);
    // const provider = new RpcProvider({ nodeUrl: RPC_GOERL });
    const provider = new Provider({ sequencer: { network: "goerli-alpha" } });
    return new Controller(provider, keypair, address, credentialId);
  }
}

export function diff(a: Policy[], b: Policy[]): Policy[] {
  return a.reduce(
    (prev, policy) =>
      b.some((approval) => equal(approval, policy)) ? prev : [...prev, policy],
    [] as Policy[],
  );
}
