import qs from "query-string";
import { AccountInterface, constants, number, RpcProvider } from "starknet";
import { AsyncMethodReturns, Connection, connectToChild } from '@cartridge/penpal';

import DeviceAccount from "./device";
import { Session, Keychain, Policy } from "./types";

export const providers = {
  [constants.StarknetChainId.TESTNET]: new RpcProvider({ nodeUrl: "https://starknet-goerli2.cartridge.gg/rpc/v0.2" }),
  [constants.StarknetChainId.TESTNET2]: new RpcProvider({ nodeUrl: "https://starknet-goerli2.cartridge.gg/rpc/v0.2" }),
  [constants.StarknetChainId.MAINNET]: new RpcProvider({ nodeUrl: "https://starknet.cartridge.gg/rpc/v0.2" }),
}

class Controller {
  private selector = "cartridge-messenger";
  private connection?: Connection<Keychain>;
  public keychain?: AsyncMethodReturns<Keychain>;
  private policies: Policy[] = [];
  private url: string = "https://x.cartridge.gg";
  public chainId: constants.StarknetChainId = constants.StarknetChainId.TESTNET;
  public accounts?: { [key in constants.StarknetChainId]: AccountInterface };

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
    iframe.allow = "publickey-credentials-get *"

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
    })

    this.connection.promise.then((keychain) =>
      this.keychain = keychain
    ).then(() => this.probe())
  }

  get account() {
    if (!this.accounts) {
      return;
    }
    return this.accounts[this.chainId]
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
      this.accounts = {
        [constants.StarknetChainId.MAINNET]: new DeviceAccount(
          providers[constants.StarknetChainId.MAINNET],
          address,
          this.keychain,
          {
            url: this.url,
          }
        ),
        [constants.StarknetChainId.TESTNET]: new DeviceAccount(
          providers[constants.StarknetChainId.TESTNET],
          address,
          this.keychain,
          {
            url: this.url,
          }
        ),
        [constants.StarknetChainId.TESTNET2]: new DeviceAccount(
          providers[constants.StarknetChainId.TESTNET2],
          address,
          this.keychain,
          {
            url: this.url,
          }
        )
      }
    } catch (e) {
      console.error(e)
      return;
    }

    return !!this.accounts[this.chainId];
  }

  async switchChain(chainId: constants.StarknetChainId) {
    if (this.chainId === chainId) {
      return;
    }

    this.chainId = chainId;
  }

  // Register a new device key.
  async register(username: string, credentialId: string, credential: { x: string, y: string }) {
    if (!this.keychain) {
      console.error("not ready for connect")
      return null;
    }

    return await this.keychain.register(username, credentialId, credential);
  }

  async login(address: string, credentialId: string, options: {
    rpId?: string
    challengeExt?: Buffer
  }) {
    if (!this.keychain) {
      console.error("not ready for connect")
      return null;
    }

    return this.keychain.login(address, credentialId, options);
  }

  async provision(address: string, credentialId: string) {
    if (!this.keychain) {
      console.error("not ready for connect")
      return null;
    }

    return this.keychain.provision(address, credentialId);
  }

  async connect() {
    if (this.accounts) {
      return this.accounts[this.chainId];
    }

    if (!this.keychain) {
      console.error("not ready for connect")
      return;
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
      "height=650,width=450"
    );

    const response = await this.keychain.connect(this.policies);

    this.accounts = {
      [constants.StarknetChainId.MAINNET]: new DeviceAccount(
        providers[constants.StarknetChainId.MAINNET],
        response.address,
        this.keychain,
        {
          url: this.url,
        }
      ),
      [constants.StarknetChainId.TESTNET]: new DeviceAccount(
        providers[constants.StarknetChainId.TESTNET],
        response.address,
        this.keychain,
        {
          url: this.url,
        }
      ),
      [constants.StarknetChainId.TESTNET2]: new DeviceAccount(
        providers[constants.StarknetChainId.TESTNET2],
        response.address,
        this.keychain,
        {
          url: this.url,
        }
      )
    }

    return this.accounts[this.chainId];
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

const BASE = number.toBN(2).pow(number.toBN(86));

export function split(n: number.BigNumberish): { x: number.BigNumberish; y: number.BigNumberish; z: number.BigNumberish } {
  const x = n.mod(BASE);
  const y = n.div(BASE).mod(BASE);
  const z = n.div(BASE).div(BASE);
  return { x, y, z };
}

export * from "./types";
export * from "./errors";
export { injectController } from "./inject";
export default Controller;