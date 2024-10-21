import { addAddressPadding } from "starknet";
import {
  AddInvokeTransactionParameters,
  Errors,
  Permission,
  RequestAccountsParameters,
  RequestFn,
  StarknetWindowObject,
  WalletEventHandlers,
  WalletEventListener,
  WalletEvents,
} from "@starknet-io/types-js";
import { AsyncMethodReturns } from "@cartridge/penpal";

import ControllerAccount from "./account";
import {
  Keychain,
  Policy,
  ResponseCodes,
  ConnectReply,
  ProbeReply,
  ControllerOptions,
  ConnectError,
  Profile,
  IFrames,
  ProfileContextTypeVariant,
} from "./types";
import { KeychainIFrame, ProfileIFrame } from "./iframe";
import { NotReadyToConnect } from "./errors";

export * from "./errors";
export * from "./types";
export { defaultPresets } from "./presets";

export default class Controller implements StarknetWindowObject {
  public id = "Controller";
  public name = "Controller";
  public version = "0.4.0";
  public icon =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTIiIGhlaWdodD0iNDQiIHZpZXdCb3g9IjAgMCA1MiA0NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE4LjE2MzIgMTguNTcxMUgzMy42NzM0VjE0LjY1MzFIMTguMTY3MUMxOC4xNjcxIDE1LjA1MzQgMTguMTYzMiAxOC42MDggMTguMTYzMiAxOC41NzExWiIgZmlsbD0iIzBGMTQxMCIvPgo8cGF0aCBkPSJNNDQuNDIwMyAxMC41TDM0Ljk0MjkgNi41QzM0LjMyIDYuMTk1NzQgMzMuNjQwNCA2LjAyNTQzIDMyLjk0OCA2SDE5LjA1MTlDMTguMzU5IDYuMDI1NDggMTcuNjc5IDYuMTk1NzkgMTcuMDU1NiA2LjVMNy41Nzk1MyAxMC41QzcuMTIxMDggMTAuNzMzOCA2LjczNzUzIDExLjA5MjMgNi40NzI3MSAxMS41MzQ0QzYuMjA3OSAxMS45NzY1IDYuMDcyNSAxMi40ODQzIDYuMDgyMDEgMTIuOTk5OVYyOS4wMDI0QzYuMDgyMDEgMjkuNTAyNCA2LjA4MjAxIDMwLjAwMjQgNi41ODA3NSAzMC41MDI0TDkuNTc0NDkgMzMuNTAyM0MxMC4wNzMyIDM0LjAwMjMgMTAuNDQ3NiAzNC4wMDIzIDExLjA3MDcgMzQuMDAyM0gxNy45MjYxQzE3LjkyNjEgMzQuNDMyMiAxNy45MjYxIDM4LjAzODYgMTcuOTI2MSAzNy45OTk3SDM0LjEzMlYzMy45OTcxSDE3LjkzOTFWMzAuMDAyNEgxMC41NzJDMTAuMDczMiAzMC4wMDI0IDEwLjA3MzIgMjkuNTAyNCAxMC4wNzMyIDI5LjUwMjRWMTAuNUMxMC4wNzMyIDEwLjUgMTAuMDczMiA5Ljk5OTk2IDEwLjU3MiA5Ljk5OTk2SDQxLjQyOTJDNDEuOTI3OSA5Ljk5OTk2IDQxLjkyNzkgMTAuNSA0MS45Mjc5IDEwLjVWMjkuNTAyNEM0MS45Mjc5IDI5LjUwMjQgNDEuOTI3OSAzMC4wMDI0IDQxLjQyOTIgMzAuMDAyNEgzNC4xMzU5VjM0LjAwMjNINDAuOTMwNEM0MS41NTM1IDM0LjAwMjMgNDEuOTI3OSAzNC4wMDIzIDQyLjQyNjYgMzMuNTAyM0w0NS40MTkxIDMwLjUwMjRDNDUuOTE3OCAzMC4wMDI0IDQ1LjkxNzggMjkuNTAyNCA0NS45MTc4IDI5LjAwMjRWMTIuOTk5OUM0NS45MjcyIDEyLjQ4NDQgNDUuNzkxNyAxMS45NzY2IDQ1LjUyNjkgMTEuNTM0NUM0NS4yNjIxIDExLjA5MjQgNDQuODc4NyAxMC43MzM5IDQ0LjQyMDMgMTAuNVoiIGZpbGw9IiMwRjE0MTAiLz4KPC9zdmc+Cg==";

  private policies: Policy[];
  private keychain?: AsyncMethodReturns<Keychain>;
  private profile?: AsyncMethodReturns<Profile>;
  private options: ControllerOptions;
  private iframes: IFrames;
  public rpc: URL;
  public account?: ControllerAccount;
  public subscriptions: WalletEvents[] = [];

  constructor(options: ControllerOptions) {
    const { policies, rpc } = options;

    this.iframes = {
      keychain: new KeychainIFrame({
        ...options,
        onClose: this.keychain?.reset,
        onConnect: (keychain) => {
          this.keychain = keychain;
        },
      }),
    };

    this.rpc = new URL(rpc);

    // TODO: remove this on the next major breaking change. pass everthing by url
    this.policies =
      policies?.map((policy) => ({
        ...policy,
        target: addAddressPadding(policy.target),
      })) || [];

    this.options = options;
  }

  request: RequestFn = async (call) => {
    switch (call.type) {
      case "wallet_getPermissions":
        await this.probe();

        if (this.account) {
          return [Permission.ACCOUNTS];
        }

        return [];

      case "wallet_requestAccounts": {
        if (this.account) {
          return [this.account.address];
        }

        const params = call.params as RequestAccountsParameters;

        if (params?.silent_mode) {
          this.account = await this.probe();
        } else {
          this.account = await this.connect();
        }

        if (this.account) {
          return [this.account.address];
        }

        return [];
      }

      case "wallet_watchAsset":
        throw {
          code: 63,
          message: "An unexpected error occurred",
          data: "wallet_watchAsset not implemented",
        } as Errors.UNEXPECTED_ERROR;

      case "wallet_addStarknetChain":
        throw {
          code: 63,
          message: "An unexpected error occurred",
          data: "wallet_addStarknetChain not implemented",
        } as Errors.UNEXPECTED_ERROR;

      case "wallet_switchStarknetChain":
        throw {
          code: 63,
          message: "An unexpected error occurred",
          data: "wallet_switchStarknetChain not implemented",
        } as Errors.UNEXPECTED_ERROR;

      case "wallet_requestChainId":
        if (!this.account) {
          throw {
            code: 63,
            message: "An unexpected error occurred",
            data: "wallet_deploymentData not implemented",
          } as Errors.UNEXPECTED_ERROR;
        }

        return await this.account.getChainId();

      case "wallet_deploymentData":
        throw {
          code: 63,
          message: "An unexpected error occurred",
          data: "wallet_deploymentData not implemented",
        } as Errors.UNEXPECTED_ERROR;

      case "wallet_addInvokeTransaction":
        if (!this.account) {
          throw {
            code: 63,
            message: "An unexpected error occurred",
            data: "wallet_deploymentData not implemented",
          } as Errors.UNEXPECTED_ERROR;
        }

        let params = call.params as AddInvokeTransactionParameters;
        return await this.account.execute(
          params.calls.map((call) => ({
            contractAddress: call.contract_address,
            entrypoint: call.entry_point,
            calldata: call.calldata,
          })),
        );

      case "wallet_addDeclareTransaction":
        throw {
          code: 63,
          message: "An unexpected error occurred",
          data: "wallet_addDeclareTransaction not implemented",
        } as Errors.UNEXPECTED_ERROR;

      case "wallet_signTypedData":
        throw {
          code: 63,
          message: "An unexpected error occurred",
          data: "wallet_signTypedData not implemented",
        } as Errors.UNEXPECTED_ERROR;
      case "wallet_supportedSpecs":
        return [];
      case "wallet_supportedWalletApi":
        return [];
      default:
        throw {
          code: 63,
          message: "An unexpected error occurred",
          data: `Unknown RPC call type: ${call.type}`,
        } as Errors.UNEXPECTED_ERROR;
    }
  };

  on: WalletEventListener = <E extends keyof WalletEventHandlers>(
    event: E,
    handler: WalletEventHandlers[E],
  ): void => {
    if (event !== "accountsChanged" && event !== "networkChanged") {
      throw new Error(`Unknown event: ${event}`);
    }
    this.subscriptions.push({ type: event, handler } as WalletEvents);
  };

  off: WalletEventListener = <E extends keyof WalletEventHandlers>(
    event: E,
    handler: WalletEventHandlers[E],
  ): void => {
    if (event !== "accountsChanged" && event !== "networkChanged") {
      throw new Error(`Unknown event: ${event}`);
    }
    const idx = this.subscriptions.findIndex(
      (sub) => sub.type === event && sub.handler === handler,
    );
    if (idx >= 0) {
      this.subscriptions.splice(idx, 1);
    }
  };

  async openSettings() {
    if (!this.keychain || !this.iframes.keychain) {
      console.error(new NotReadyToConnect().message);
      return null;
    }
    this.iframes.keychain.open();
    const res = await this.keychain.openSettings();
    this.iframes.keychain.close();
    if (res && (res as ConnectError).code === ResponseCodes.NOT_CONNECTED) {
      return false;
    }
    return true;
  }

  async probe() {
    try {
      await this.waitForKeychain();

      if (!this.keychain) {
        console.error(new NotReadyToConnect().message);
        return;
      }

      const response = (await this.keychain.probe(
        this.rpc.toString(),
      )) as ProbeReply;

      this.account = new ControllerAccount(
        this,
        response.address,
        this.keychain,
        this.options,
        this.iframes.keychain,
      );
    } catch (e) {
      console.error(e);
      return;
    }

    if (
      this.options.profileUrl &&
      this.options.indexerUrl &&
      !this.iframes.profile
    ) {
      const username = await this.keychain.username();
      this.iframes.profile = new ProfileIFrame({
        profileUrl: this.options.profileUrl,
        indexerUrl: this.options.indexerUrl,
        address: this.account?.address,
        username,
        rpcUrl: this.rpc.toString(),
        tokens: this.options.tokens,
        onConnect: (profile) => {
          this.profile = profile;
        },
      });
    }

    return this.account;
  }

  async connect() {
    if (this.account) {
      return this.account;
    }

    if (!this.keychain || !this.iframes.keychain) {
      console.error(new NotReadyToConnect().message);
      return;
    }

    if (!!document.hasStorageAccess) {
      const ok = await document.hasStorageAccess();
      if (!ok) {
        await document.requestStorageAccess();
      }
    }

    this.iframes.keychain.open();

    try {
      let response = await this.keychain.connect(
        this.policies,
        this.rpc.toString(),
      );
      if (response.code !== ResponseCodes.SUCCESS) {
        throw new Error(response.message);
      }

      response = response as ConnectReply;
      this.account = this.account = new ControllerAccount(
        this,
        response.address,
        this.keychain,
        this.options,
        this.iframes.keychain,
      );

      return this.account;
    } catch (e) {
      console.log(e);
    } finally {
      this.iframes.keychain.close();
    }
  }

  openProfile(tab: ProfileContextTypeVariant = "inventory") {
    if (!this.options.indexerUrl) {
      console.error("`indexerUrl` option is required to open profile");
      return;
    }
    if (!this.profile || !this.iframes.profile) {
      console.error("Profile is not ready");
      return;
    }

    this.profile.navigate(tab);
    this.iframes.profile.open();
  }

  async disconnect() {
    if (!this.keychain) {
      console.error(new NotReadyToConnect().message);
      return;
    }

    if (!!document.hasStorageAccess) {
      const ok = await document.hasStorageAccess();
      if (!ok) {
        await document.requestStorageAccess();
      }
    }

    this.account = undefined;
    return this.keychain.disconnect();
  }

  revoke(origin: string, _policy: Policy[]) {
    if (!this.keychain) {
      console.error(new NotReadyToConnect().message);
      return null;
    }

    return this.keychain.revoke(origin);
  }

  username() {
    if (!this.keychain) {
      console.error(new NotReadyToConnect().message);
      return;
    }

    return this.keychain.username();
  }

  fetchControllers(
    contractAddresses: string[],
  ): Promise<Record<string, string>> {
    if (!this.keychain) {
      throw new NotReadyToConnect().message;
    }

    return this.keychain.fetchControllers(contractAddresses);
  }

  async delegateAccount() {
    if (!this.keychain) {
      console.error(new NotReadyToConnect().message);
      return null;
    }

    return await this.keychain.delegateAccount();
  }

  private waitForKeychain({
    timeout = 5000,
    interval = 100,
  }:
    | {
        timeout?: number;
        interval?: number;
      }
    | undefined = {}) {
    return new Promise<void>((resolve, reject) => {
      const startTime = Date.now();
      const id = setInterval(() => {
        if (Date.now() - startTime > timeout) {
          clearInterval(id);
          reject(new Error("Timeout waiting for keychain"));
          return;
        }
        if (!this.keychain) return;

        clearInterval(id);
        resolve();
      }, interval);
    });
  }
}

export class InjectedController extends Controller {
  constructor(options: ControllerOptions) {
    super(options);

    if (typeof window !== "undefined") {
      (window as any).starknet_controller = this;
    }
  }
}
