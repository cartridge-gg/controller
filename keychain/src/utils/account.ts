import { ec, Account, KeyPair, number, ProviderInterface, RpcProvider, Provider, Call, AllowArray, EstimateFeeDetails, EstimateFee, Invocation, InvocationsDetails } from "starknet";
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

export type InvocationWithDetails = {
  invocation: Invocation, details: InvocationsDetails
}

export type RegisterData = {
  assertion: RawAssertion;
  invoke: InvocationWithDetails;
}

export async function fetchUser(address: string) {
  const res = await fetch(process.env.NEXT_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: `{"query":"query {
        accounts(where: {contractAddress: \\"${address}\\"}) {
          edges {
            node {
              id
              credential {
                id
            }
        }
      }
    }
  }"}`,
  });
  return res.json();
}

export default class Controller extends Account {
  protected publicKey: string;
  protected keypair: KeyPair;
  protected webauthn: WebauthnAccount;

  constructor(provider: ProviderInterface, keypair: KeyPair, address: string, credentialId: string, options?: {
    rpId?: string;
  }) {
    super(provider, address, keypair);
    this.signer = new DeviceSigner(keypair);
    this.keypair = keypair;
    this.publicKey = ec.getStarkKey(keypair);

    this.webauthn = new WebauthnAccount(
      address,
      credentialId,
      this.publicKey,
      options,
    );
  }

  isRegistered(chainId: StarknetChainId) {
    const register = Storage.get(`@register/${chainId}/set_device_key`)
    return register === true;
  }

  estimateInvokeFee(calls: AllowArray<Call>, details: EstimateFeeDetails & {
    chainId: StarknetChainId
  }): Promise<EstimateFee> {
    const register = Storage.get(`@register/${details.chainId}/set_device_key`)
    if (!register) {
      const call = this.getRegisterCall(details.chainId)
    }

    return;
  }

  async getRegisterCall(chainId: StarknetChainId): Promise<RegisterData> {
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

    const nonce = await this.getNonce();
    const version = toBN(transactionVersion);
    const calldata = fromCallsToExecuteCalldata(calls);

    const suggestedMaxFee = 1000000;

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
