import qs from "query-string";
import { AccountInterface, Call, number } from "starknet";
import { AsyncMethodReturns, Connection, connectToChild } from '@cartridge/penpal';

import DeviceAccount from "./device";
import { Keychain, Scope } from "./types";
import { BigNumberish, toBN } from "starknet/utils/number";
import { calculateContractAddressFromHash, getSelectorFromName } from "starknet/utils/hash";
import { encodeShortString } from "starknet/utils/shortString";
import WebauthnAccount from "./webauthn";

const PROXY_CLASS = "0x793a374a266432184f68b29546d14fedfdcbe6346bc51bd34ad730e6ff914f3";
const ACCOUNT_CLASS = "0x21a58754bd7658d29f70e1e5dbebf84ae393a5ef704c4f5a763cc8a61cb3414";
const CONTROLLER_CLASS = "0x10baeb4233aae14d72f1c2f60d8c46be61436fb06631c835df93b3a9f566351";
const ACCOUNT_ADDRESS = "0x07d7bbf672edd77578b8864c3e2900ac9194698220adb1b1ecdc45f9222ca291";

class Controller {
  private selector = "cartridge-messenger";
  private connection?: Connection<Keychain>;
  private keychain?: AsyncMethodReturns<Keychain>;
  private scopes: Scope[] = [];
  private url: string = "https://x.cartridge.gg";
  private account: AccountInterface | undefined;

  constructor(
    scopes?: Scope[],
    options?: {
      url?: string;
      origin?: string;
    }
  ) {
    if (scopes) {
      this.scopes = scopes;
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

    const { x: x0, y: x1, z: x2 } = split(toBN(credential.x))
    const { x: y0, y: y1, z: y2 } = split(toBN(credential.y))

    const deviceKey = await this.keychain.provision();
    const address = calculateContractAddressFromHash(
      encodeShortString(username),
      toBN(PROXY_CLASS),
      [
        toBN(ACCOUNT_CLASS),
        getSelectorFromName("initialize"),
        "9",
        toBN(CONTROLLER_CLASS),
        "7",
        x0,
        x1,
        x2,
        y0,
        y1,
        y2,
        toBN(deviceKey),
        "12",
      ],
      toBN(ACCOUNT_ADDRESS),
    )

    return { address, deviceKey }
  }

  async login(address: string, credentialId: string, pub: string) {
    if (!this.keychain) {
      console.error("not ready for connect")
      return null;
    }

    const account = new WebauthnAccount(address, credentialId, pub);
    const deviceKey = await this.keychain.provision();
    const calls: Call[] = [
      {
        contractAddress: address,
        entrypoint: "add_device_key",
        calldata: [deviceKey],
      },
    ];

    await account.execute(calls)
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
        scopes: JSON.stringify(this.scopes),
      })}`,
      "_blank",
      "height=650,width=400"
    );

    const response = await this.keychain.connect(this.scopes);

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
      console.error("not ready for connect")
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