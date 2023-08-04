import { AccountInterface, constants, RpcProvider } from "starknet";
import {
  AsyncMethodReturns,
  Connection,
  connectToChild,
} from "@cartridge/penpal";

import DeviceAccount from "./device";
import {
  Session,
  Keychain,
  Policy,
  ResponseCodes,
  ConnectReply,
  ProbeReply,
  Modal,
  SupportedChainIds,
} from "./types";
import { createModal } from "./modal";

export const providers = {
  [constants.StarknetChainId.TESTNET]: new RpcProvider({
    nodeUrl:
      "https://starknet-goerli.g.alchemy.com/v2/FS0Fge2Rq1dlf2IsAIC_Ecy0UBp9uq51",
  }),
  [constants.StarknetChainId.MAINNET]: new RpcProvider({
    nodeUrl:
      "https://starknet-mainnet.g.alchemy.com/v2/-FbmIoy3U7xEqQhuhW6wkDB2uqfu0yKi",
  }),
};

class Controller {
  private connection?: Connection<Keychain>;
  public keychain?: AsyncMethodReturns<Keychain>;
  private policies: Policy[] = [];
  private url: string = "https://x.cartridge.gg";
  public chainId: SupportedChainIds = SupportedChainIds.TESTNET;
  public accounts?: { [key in SupportedChainIds]: AccountInterface };
  private modal?: Modal;
  private starterPackId?: string;

  constructor(
    policies?: Policy[],
    options?: {
      url?: string;
      origin?: string;
      starterPackId?: string;
      chainId?: SupportedChainIds;
    },
  ) {
    if (policies) {
      this.policies = policies;
    }

    if (options?.chainId) {
      this.chainId = options.chainId;
    }

    if (options?.starterPackId) {
      this.starterPackId = options.starterPackId;
    }

    if (options?.url) {
      this.url = options.url;
    }

    if (typeof document === "undefined") {
      return;
    }

    this.modal = createModal(this.url, () => {
      this.keychain?.reset();
    });

    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      document.body.appendChild(this.modal.element);
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        document.body.appendChild(this.modal!.element);
      });
    }

    this.connection = connectToChild<Keychain>({
      iframe: this.modal.element.children[0] as HTMLIFrameElement,
    });

    this.connection.promise
      .then((keychain) => (this.keychain = keychain))
      .then(() => this.probe());
  }

  get account() {
    if (!this.accounts) {
      return;
    }
    return this.accounts[this.chainId];
  }

  async ready() {
    return this.connection?.promise
      .then(() => this.probe())
      .then(
        (res) => !!res,
        () => false,
      );
  }

  async probe() {
    if (!this.keychain || !this.modal) {
      console.error("not ready for connect");
      return null;
    }

    try {
      const res = await this.keychain.probe();
      if (res.code !== ResponseCodes.SUCCESS) {
        return;
      }

      const { address } = res as ProbeReply;
      this.accounts = {
        [constants.StarknetChainId.MAINNET]: new DeviceAccount(
          providers[constants.StarknetChainId.MAINNET],
          address,
          this.keychain,
          this.modal,
        ),
        [constants.StarknetChainId.TESTNET]: new DeviceAccount(
          providers[constants.StarknetChainId.TESTNET],
          address,
          this.keychain,
          this.modal,
        ),
      };
    } catch (e) {
      console.error(e);
      return;
    }

    return !!this.accounts[this.chainId];
  }

  async switchChain(chainId: constants.StarknetChainId) {
    const cid =
      chainId === constants.StarknetChainId.MAINNET
        ? SupportedChainIds.MAINNET
        : SupportedChainIds.TESTNET;
    if (this.chainId === cid) {
      return;
    }

    this.chainId = cid;
  }

  // Register a new device key.
  async register(
    username: string,
    credentialId: string,
    credential: { x: string; y: string },
  ) {
    if (!this.keychain) {
      console.error("not ready for connect");
      return null;
    }

    return await this.keychain.register(username, credentialId, credential);
  }

  async login(
    address: string,
    credentialId: string,
    options: {
      rpId?: string;
      challengeExt?: Buffer;
    },
  ) {
    if (!this.keychain) {
      console.error("not ready for connect");
      return null;
    }

    return this.keychain.login(address, credentialId, options);
  }

  async provision(address: string, credentialId: string) {
    if (!this.keychain) {
      console.error("not ready for connect");
      return null;
    }

    return this.keychain.provision(address, credentialId);
  }

  async issueStarterPack(id: string) {
    if (!this.keychain || !this.modal) {
      console.error("not ready for connect");
      return;
    }

    this.modal.open();

    try {
      if (!this.account) {
        let response = await this.keychain.connect(
          this.policies,
          undefined,
          this.chainId,
        );
        if (response.code !== ResponseCodes.SUCCESS) {
          throw new Error(response.message);
        }
      }

      return await this.keychain.issueStarterPack(id);
    } catch (e) {
      console.log(e);
    } finally {
      this.modal.close();
    }
  }

  async showQuests(gameId: string) {
    if (!this.keychain || !this.modal) {
      console.error("not ready for connect");
      return;
    }

    this.modal.open();

    try {
      return await this.keychain.showQuests(gameId);
    } catch (e) {
      console.error(e);
    } finally {
      this.modal.close();
    }
  }

  async connect() {
    if (this.accounts) {
      return this.accounts[this.chainId];
    }

    if (!this.keychain || !this.modal) {
      console.error("not ready for connect");
      return;
    }

    if (!!document.hasStorageAccess) {
      const ok = await document.hasStorageAccess();
      if (!ok) {
        await document.requestStorageAccess();
      }
    }

    this.modal.open();

    try {
      let response = await this.keychain.connect(
        this.policies,
        undefined,
        this.chainId,
      );
      if (response.code !== ResponseCodes.SUCCESS) {
        throw new Error(response.message);
      }

      response = response as ConnectReply;
      this.accounts = {
        [constants.StarknetChainId.MAINNET]: new DeviceAccount(
          providers[constants.StarknetChainId.MAINNET],
          response.address,
          this.keychain,
          this.modal,
        ),
        [constants.StarknetChainId.TESTNET]: new DeviceAccount(
          providers[constants.StarknetChainId.TESTNET],
          response.address,
          this.keychain,
          this.modal,
        ),
      };

      if (this.starterPackId) {
        await this.keychain.issueStarterPack(this.starterPackId);
      }

      return this.accounts[this.chainId];
    } catch (e) {
      console.log(e);
    } finally {
      this.modal.close();
    }
  }

  async disconnect() {
    if (!this.keychain) {
      console.error("not ready for disconnect");
      return null;
    }

    if (!!document.hasStorageAccess) {
      const ok = await document.hasStorageAccess();
      if (!ok) {
        await document.requestStorageAccess();
      }
    }

    return await this.keychain.disconnect();
  }

  revoke(origin: string, policy: Policy[]) {
    if (!this.keychain) {
      console.error("not ready for disconnect");
      return null;
    }

    return this.keychain.revoke(origin);
  }

  async approvals(origin: string): Promise<Session | undefined> {
    if (!this.keychain) {
      console.error("not ready for disconnect");
      return;
    }

    return this.keychain.approvals(origin);
  }
}

export * from "./types";
export * from "./errors";
export { computeAddress, split, verifyMessageHash } from "./utils";
export { injectController } from "./inject";
export default Controller;
