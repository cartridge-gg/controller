import qs from "query-string";
import { AccountInterface, Call, number } from "starknet";
import { AsyncMethodReturns, Connection, connectToChild } from '@cartridge/penpal';

import DeviceAccount from "./device";
import { Session, Keychain, Policy } from "./types";
import { BigNumberish, toBN } from "starknet/dist/utils/number";
import WebauthnAccount, { formatAssertion } from "./webauthn";
import { calculateTransactionHash, transactionVersion } from "starknet/dist/utils/hash";
import { fromCallsToExecuteCalldata } from "starknet/dist/utils/transaction";

class Controller {
  private selector = "cartridge-messenger";
  private connection?: Connection<Keychain>;
  public keychain?: AsyncMethodReturns<Keychain>;
  private policies: Policy[] = [];
  private url: string = "https://x.cartridge.gg";
  private account: AccountInterface | undefined;

  constructor(
    policies?: Policy[],
    options?: {
      url?: string;
      origin?: string;
    }
  ) {
    if (policies) {
      this.policies = policies;
    }

    if (options?.url) {
      this.url = options.url;
    }

    if (typeof document === "undefined") {
      return
    }

    const iframe = document.createElement("iframe");
    iframe.id = this.selector;
    iframe.src = this.url;
    iframe.style.opacity = "0";
    iframe.style.height = "0";
    iframe.style.width = "0";
    iframe.sandbox.add("allow-scripts")
    iframe.sandbox.add("allow-same-origin")

    if (!!document.hasStorageAccess) {
      iframe.sandbox.add("allow-storage-access-by-user-activation")
    }

    if (
      document.readyState === 'complete' ||
      document.readyState === 'interactive'
    ) {
      document.body.appendChild(iframe);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(iframe);
      });
    }

    this.connection = connectToChild<Keychain>({
      iframe,
      debug: true,
    })

    this.connection.promise.then((keychain) =>
      this.keychain = keychain
    ).then(() => this.probe())
  }

  async ready() {
    return this.connection?.promise.then(() => this.probe()).then((res) => !!res, () => false)
  }

  async probe() {
    if (!this.keychain) {
      console.error("not ready for connect")
      return null;
    }

    try {
      const { address } = await this.keychain.probe();
      this.account = new DeviceAccount(
        address,
        this.keychain,
        {
          url: this.url,
        }
      );
    } catch (e) {
      console.error(e)
    }

    return !!this.account;
  }

  // Register a new device key.
  async register(username: string, credential: { x: string, y: string }) {
    if (!this.keychain) {
      console.error("not ready for connect")
      return null;
    }

    return await this.keychain.register(username, credential);
  }

  async login(address: string, credentialId: string, options: {
    rpId?: string
    challengeExt?: Buffer
  }) {
    if (!this.keychain) {
      console.error("not ready for connect")
      return null;
    }

    const deviceKey = await this.keychain.provision(address);
    const account = new WebauthnAccount(address, credentialId, deviceKey, options);
    const calls: Call[] = [
      {
        contractAddress: address,
        entrypoint: "add_device_key",
        calldata: [deviceKey],
      },
    ];

    const nonce = await account.getNonce();
    const { suggestedMaxFee } = await account.estimateInvokeFee(calls, { nonce });
    const maxFee = suggestedMaxFee.toString();

    const version = toBN(transactionVersion);
    const chainId = await account.getChainId();

    const calldata = fromCallsToExecuteCalldata(calls);
    let msgHash = calculateTransactionHash(
      account.address,
      version,
      calldata,
      maxFee,
      chainId,
      nonce
    );

    let challenge = Buffer.from(
      msgHash.slice(2).padStart(64, "0").slice(0, 64),
      "hex",
    );

    if (options.challengeExt) {
      challenge = Buffer.concat([challenge, options.challengeExt])
    }

    const assertion = await account.signer.sign(challenge)
    const signature = formatAssertion(assertion)

    const receipt = await account.invokeFunction(
      { contractAddress: account.address, calldata, signature },
      {
        nonce,
        maxFee,
        version,
      }
    );

    return { assertion, receipt }
  }

  async provision(address: string) {
    if (!this.keychain) {
      console.error("not ready for connect")
      return null;
    }

    return this.keychain.provision(address);
  }

  async connect() {
    if (this.account) {
      return this.account;
    }

    if (!this.keychain) {
      console.error("not ready for connect")
      return null;
    }

    if (!!document.hasStorageAccess) {
      const ok = await document.hasStorageAccess()
      if (!ok) {
        await document.requestStorageAccess()
      }
    }

    window.open(
      `${this.url}/connect?${qs.stringify({
        origin: window.origin,
        policies: JSON.stringify(this.policies),
      })}`,
      "_blank",
      "height=650,width=400"
    );

    const response = await this.keychain.connect(this.policies);

    this.account = new DeviceAccount(
      response.address,
      this.keychain,
      {
        url: this.url,
      }
    );

    return this.account;
  }

  async disconnect() {
    if (!this.keychain) {
      console.error("not ready for disconnect")
      return null;
    }

    if (!!document.hasStorageAccess) {
      const ok = await document.hasStorageAccess()
      if (!ok) {
        await document.requestStorageAccess()
      }
    }

    return await this.keychain.disconnect();
  }

  revoke(origin: string, policy: Policy[]) {
    if (!this.keychain) {
      console.error("not ready for disconnect")
      return null;
    }

    return this.keychain.revoke(origin);
  }

  async approvals(origin: string): Promise<Session | undefined> {
    if (!this.keychain) {
      console.error("not ready for disconnect")
      return;
    }

    return this.keychain.approvals(origin)
  }
}

const BASE = number.toBN(2).pow(toBN(86));

export function split(n: BigNumberish): { x: BigNumberish; y: BigNumberish; z: BigNumberish } {
  const x = n.mod(BASE);
  const y = n.div(BASE).mod(BASE);
  const z = n.div(BASE).div(BASE);
  return { x, y, z };
}


export * from "./types";
export * from "./errors";
export * from "./webauthn";
export default Controller;