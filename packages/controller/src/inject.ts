import Controller from ".";
import { AccountInterface } from "starknet";
import {
  RequestFn,
  StarknetWindowObject,
  WalletEventHandlers,
  WalletEventListener,
  WalletEvents,
} from "@starknet-io/types-js";

export class InjectedController implements StarknetWindowObject {
  public id = "Cartridge";
  public name = "Cartridge";
  public version = "0.3.37";
  public icon =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTIiIGhlaWdodD0iNDQiIHZpZXdCb3g9IjAgMCA1MiA0NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE4LjE2MzIgMTguNTcxMUgzMy42NzM0VjE0LjY1MzFIMTguMTY3MUMxOC4xNjcxIDE1LjA1MzQgMTguMTYzMiAxOC42MDggMTguMTYzMiAxOC41NzExWiIgZmlsbD0iIzBGMTQxMCIvPgo8cGF0aCBkPSJNNDQuNDIwMyAxMC41TDM0Ljk0MjkgNi41QzM0LjMyIDYuMTk1NzQgMzMuNjQwNCA2LjAyNTQzIDMyLjk0OCA2SDE5LjA1MTlDMTguMzU5IDYuMDI1NDggMTcuNjc5IDYuMTk1NzkgMTcuMDU1NiA2LjVMNy41Nzk1MyAxMC41QzcuMTIxMDggMTAuNzMzOCA2LjczNzUzIDExLjA5MjMgNi40NzI3MSAxMS41MzQ0QzYuMjA3OSAxMS45NzY1IDYuMDcyNSAxMi40ODQzIDYuMDgyMDEgMTIuOTk5OVYyOS4wMDI0QzYuMDgyMDEgMjkuNTAyNCA2LjA4MjAxIDMwLjAwMjQgNi41ODA3NSAzMC41MDI0TDkuNTc0NDkgMzMuNTAyM0MxMC4wNzMyIDM0LjAwMjMgMTAuNDQ3NiAzNC4wMDIzIDExLjA3MDcgMzQuMDAyM0gxNy45MjYxQzE3LjkyNjEgMzQuNDMyMiAxNy45MjYxIDM4LjAzODYgMTcuOTI2MSAzNy45OTk3SDM0LjEzMlYzMy45OTcxSDE3LjkzOTFWMzAuMDAyNEgxMC41NzJDMTAuMDczMiAzMC4wMDI0IDEwLjA3MzIgMjkuNTAyNCAxMC4wNzMyIDI5LjUwMjRWMTAuNUMxMC4wNzMyIDEwLjUgMTAuMDczMiA5Ljk5OTk2IDEwLjU3MiA5Ljk5OTk2SDQxLjQyOTJDNDEuOTI3OSA5Ljk5OTk2IDQxLjkyNzkgMTAuNSA0MS45Mjc5IDEwLjVWMjkuNTAyNEM0MS45Mjc5IDI5LjUwMjQgNDEuOTI3OSAzMC4wMDI0IDQxLjQyOTIgMzAuMDAyNEgzNC4xMzU5VjM0LjAwMjNINDAuOTMwNEM0MS41NTM1IDM0LjAwMjMgNDEuOTI3OSAzNC4wMDIzIDQyLjQyNjYgMzMuNTAyM0w0NS40MTkxIDMwLjUwMjRDNDUuOTE3OCAzMC4wMDI0IDQ1LjkxNzggMjkuNTAyNCA0NS45MTc4IDI5LjAwMjRWMTIuOTk5OUM0NS45MjcyIDEyLjQ4NDQgNDUuNzkxNyAxMS45NzY2IDQ1LjUyNjkgMTEuNTM0NUM0NS4yNjIxIDExLjA5MjQgNDQuODc4NyAxMC43MzM5IDQ0LjQyMDMgMTAuNVoiIGZpbGw9IiMwRjE0MTAiLz4KPC9zdmc+Cg==";
  public isConnected: boolean = false;
  public account?: AccountInterface;
  public selectedAddress?: string;

  public subscriptions: WalletEvents[] = [];

  private controller: Controller;

  constructor() {
    this.controller = new Controller();
    this.controller.ready().then((isConnected) => {
      this.isConnected = !!isConnected;
      if (this.controller.account) {
        this.account = this.controller.account;
        this.selectedAddress = this.account.address;
      }
    });
  }

  request: RequestFn = async (call) => {
    switch (call.type) {
      case "wallet_getPermissions":
        throw new Error("wallet_getPermissions not implemented");

      case "wallet_requestAccounts":
        throw new Error("wallet_requestAccounts not implemented");

      case "wallet_watchAsset":
        throw new Error("wallet_watchAsset not implemented");

      case "wallet_addStarknetChain":
        throw new Error("wallet_addStarknetChain not implemented");

      case "wallet_switchStarknetChain":
        throw new Error("wallet_switchStarknetChain not implemented");

      case "wallet_requestChainId":
        throw new Error("wallet_requestChainId not implemented");

      case "wallet_deploymentData":
        throw new Error("wallet_deploymentData not implemented");

      case "wallet_addInvokeTransaction":
        throw new Error("wallet_addInvokeTransaction not implemented");

      case "wallet_addDeclareTransaction":
        throw new Error("wallet_addDeclareTransaction not implemented");

      case "wallet_signTypedData":
        throw new Error("wallet_signTypedData not implemented");

      case "wallet_supportedSpecs":
        throw new Error("wallet_supportedSpecs not implemented");

      case "wallet_supportedWalletApi":
        throw new Error("wallet_supportedWalletApi not implemented");

      default:
        throw new Error(`Unknown RPC call type: ${call.type}`);
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

  enable = async (): Promise<string[]> => {
    const account = await this.controller.connect();
    if (!account) {
      return [];
    }

    return [account.address];
  };

  isPreauthorized = async (): Promise<boolean> => {
    return this.controller
      .ready()
      .then(this.controller.probe)
      .then((connected) => !!connected);
  };
}

function injectController() {
  (window as any).starknet_cartridge = new InjectedController();
}

export { injectController };
