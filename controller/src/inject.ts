import { AccountInterface, defaultProvider, ProviderInterface } from "starknet";
import Controller from ".";

export type EventType = "accountsChanged" | "networkChanged";

export type EventHandler = (data: any) => void;

// EIP-747:
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-747.md
interface WatchAssetParameters {
    type: string; // The asset's interface, e.g. 'ERC20'
    options: {
        address: string; // The hexadecimal StarkNet address of the token contract
        symbol?: string; // A ticker symbol or shorthand, up to 5 alphanumerical characters
        decimals?: number; // The number of asset decimals
        image?: string; // A string url of the token logo
        name?: string; // The name of the token - not in spec
    };
}

export type RpcMessage =
    | {
        type: "wallet_watchAsset";
        params: WatchAssetParameters;
        result: boolean;
    }
    | {
        type: string;
        params: unknown;
        result: never;
    };

export type AccountChangeEventHandler = (accounts: string[]) => void

export type NetworkChangeEventHandler = (network?: string) => void

export type WalletEventHandlers =
    | AccountChangeEventHandler
    | NetworkChangeEventHandler

export type WalletEvents =
    | {
        type: "accountsChanged"
        handler: AccountChangeEventHandler
    }
    | {
        type: "networkChanged"
        handler: NetworkChangeEventHandler
    }

export interface IStarknetWindowObject {
    request: <T extends RpcMessage>(call: Omit<T, "result">) => Promise<T["result"]>;
    enable: (options?: { showModal?: boolean }) => Promise<string[]>;
    isPreauthorized: () => Promise<boolean>;
    on: (event: EventType, handleEvent: EventHandler) => void;
    off: (event: EventType, handleEvent: EventHandler) => void;

    id: string;
    name: string;
    version: string;
    icon: string;
    provider: ProviderInterface;
    isConnected: boolean;
    account?: AccountInterface;
    selectedAddress?: string;
}

export class InjectedController implements IStarknetWindowObject {
    public id = "Cartridge";
    public name = "Cartridge";
    public version = "0.0.1"
    public icon = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTIiIGhlaWdodD0iNDQiIHZpZXdCb3g9IjAgMCA1MiA0NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE4LjE2MzIgMTguNTcxMUgzMy42NzM0VjE0LjY1MzFIMTguMTY3MUMxOC4xNjcxIDE1LjA1MzQgMTguMTYzMiAxOC42MDggMTguMTYzMiAxOC41NzExWiIgZmlsbD0iIzBGMTQxMCIvPgo8cGF0aCBkPSJNNDQuNDIwMyAxMC41TDM0Ljk0MjkgNi41QzM0LjMyIDYuMTk1NzQgMzMuNjQwNCA2LjAyNTQzIDMyLjk0OCA2SDE5LjA1MTlDMTguMzU5IDYuMDI1NDggMTcuNjc5IDYuMTk1NzkgMTcuMDU1NiA2LjVMNy41Nzk1MyAxMC41QzcuMTIxMDggMTAuNzMzOCA2LjczNzUzIDExLjA5MjMgNi40NzI3MSAxMS41MzQ0QzYuMjA3OSAxMS45NzY1IDYuMDcyNSAxMi40ODQzIDYuMDgyMDEgMTIuOTk5OVYyOS4wMDI0QzYuMDgyMDEgMjkuNTAyNCA2LjA4MjAxIDMwLjAwMjQgNi41ODA3NSAzMC41MDI0TDkuNTc0NDkgMzMuNTAyM0MxMC4wNzMyIDM0LjAwMjMgMTAuNDQ3NiAzNC4wMDIzIDExLjA3MDcgMzQuMDAyM0gxNy45MjYxQzE3LjkyNjEgMzQuNDMyMiAxNy45MjYxIDM4LjAzODYgMTcuOTI2MSAzNy45OTk3SDM0LjEzMlYzMy45OTcxSDE3LjkzOTFWMzAuMDAyNEgxMC41NzJDMTAuMDczMiAzMC4wMDI0IDEwLjA3MzIgMjkuNTAyNCAxMC4wNzMyIDI5LjUwMjRWMTAuNUMxMC4wNzMyIDEwLjUgMTAuMDczMiA5Ljk5OTk2IDEwLjU3MiA5Ljk5OTk2SDQxLjQyOTJDNDEuOTI3OSA5Ljk5OTk2IDQxLjkyNzkgMTAuNSA0MS45Mjc5IDEwLjVWMjkuNTAyNEM0MS45Mjc5IDI5LjUwMjQgNDEuOTI3OSAzMC4wMDI0IDQxLjQyOTIgMzAuMDAyNEgzNC4xMzU5VjM0LjAwMjNINDAuOTMwNEM0MS41NTM1IDM0LjAwMjMgNDEuOTI3OSAzNC4wMDIzIDQyLjQyNjYgMzMuNTAyM0w0NS40MTkxIDMwLjUwMjRDNDUuOTE3OCAzMC4wMDI0IDQ1LjkxNzggMjkuNTAyNCA0NS45MTc4IDI5LjAwMjRWMTIuOTk5OUM0NS45MjcyIDEyLjQ4NDQgNDUuNzkxNyAxMS45NzY2IDQ1LjUyNjkgMTEuNTM0NUM0NS4yNjIxIDExLjA5MjQgNDQuODc4NyAxMC43MzM5IDQ0LjQyMDMgMTAuNVoiIGZpbGw9IiMwRjE0MTAiLz4KPC9zdmc+Cg==";
    public provider = defaultProvider
    public isConnected: boolean = false;
    public account?: AccountInterface;
    public selectedAddress?: string;

    public subscriptions: WalletEvents[] = []

    private controller: Controller;

    constructor() {
        this.controller = new Controller();
        this.controller.ready().then(isConnected => {
            this.isConnected = !!isConnected;
            if (this.controller.account) {
                this.account = this.controller.account;
                this.selectedAddress = this.account.address;
            }
        })
    }

    request = (call: Omit<RpcMessage, "result">): Promise<RpcMessage["result"]> => {
        throw Error("Not implemented")
    }

    enable = async (): Promise<string[]> => {
        const account = await this.controller.connect()
        if (!account) {
            return [];
        }

        return [account.address];
    };

    isPreauthorized = async (): Promise<boolean> => {
        return this.controller.ready().then(this.controller.probe).then(connected => !!connected);
    }

    on = (type: EventType, handler: EventHandler): void => {
        if (type === "accountsChanged") {
            this.subscriptions.push({
                type,
                handler,
            });
        } else if (type === "networkChanged") {
            this.subscriptions.push({
                type,
                handler,
            });
        } else {
            throw new Error(`Unknwown event: ${type}`);
        }
    }

    off = (type: EventType, handler: EventHandler): void => {
        if (type !== "accountsChanged" && type !== "networkChanged") {
            throw new Error(`Unknwown event: ${type}`);
        }

        const idx = this.subscriptions.findIndex(
            (userEvent) =>
                userEvent.type === type && userEvent.handler === handler,
        );

        if (idx >= 0) {
            this.subscriptions.splice(idx, 1);
        }
    }
}

function injectController() {
    (window as any).starknet_cartridge = new InjectedController();
}

export { injectController };