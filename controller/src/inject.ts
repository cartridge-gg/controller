import { constants } from "starknet";
import { AccountInterface, ProviderInterface } from "starknet";
import Controller, { providers } from ".";
import { Policy } from "./types";

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

export type AccountChangeEventHandler = (accounts: string[]) => void;

export type NetworkChangeEventHandler = (network?: string) => void;

export type WalletEventHandlers =
    | AccountChangeEventHandler
    | NetworkChangeEventHandler;

export type WalletEvents =
    | {
        type: "accountsChanged";
        handler: AccountChangeEventHandler;
    }
    | {
        type: "networkChanged";
        handler: NetworkChangeEventHandler;
    };

export interface IStarknetWindowObject {
    request: <T extends RpcMessage>(
        call: Omit<T, "result">
    ) => Promise<T["result"]>;
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
    public version = "0.0.1";
    public icon =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjkiIGhlaWdodD0iNTciIHZpZXdCb3g9IjAgMCA2OSA1NyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yMy41NTEzIDAuMDM5MDYyNUg0NC42Mjc4TDQ0LjcwMTIgMC4wNDE3NTc4QzQ2LjI2MjQgMC4wOTkwOTkyIDQ3Ljc5NDggMC40NzQ3OTUgNDkuMjA0OSAxLjE0NTA5TDYzLjUyMjcgNy4xODc5NUw2My42NTIyIDcuMjU0MDRDNjUuMDExOCA3Ljk0ODEyIDY2LjE0NzggOS4wMTA3NyA2Ni45MzE2IDEwLjMxOTNDNjcuNzA4MSAxMS42MTU3IDY4LjEwODUgMTMuMTAyMSA2OC4wODg5IDE0LjYxMjFWMzguNjg0QzY4LjA4ODkgMzguNzEgNjguMDg5IDM4LjczNzYgNjguMDg5MSAzOC43NjY2QzY4LjA5MTQgMzkuNjQwOSA2OC4wOTc0IDQxLjgzNTYgNjYuMTY5NyA0My43NjgxTDYxLjY2MjYgNDguMjg2NUM2MC44OTEzIDQ5LjA1OTggNTkuOTY3IDQ5LjY3NDkgNTguODA3IDQ5Ljk4NDlDNTcuOTIxNyA1MC4yMjE1IDU3LjA1MzUgNTAuMjE3IDU2LjY2MyA1MC4yMTVDNTYuNjMxMSA1MC4yMTQ4IDU2LjYwMjQgNTAuMjE0NyA1Ni41NzcxIDUwLjIxNDdMNTAuMzM4NSA1MC4yMDk5TDUwLjMzNjIgNTYuMjM1M0gxNy45MjkzVjUwLjIxNDdIMTEuNjA0QzExLjU3ODggNTAuMjE0NyAxMS41NTAxIDUwLjIxNDggMTEuNTE4MiA1MC4yMTVDMTEuMTI3NiA1MC4yMTcgMTAuMjU5NSA1MC4yMjE1IDkuMzc0MTYgNDkuOTg0OUM4LjIxNDUgNDkuNjc0OSA3LjI5MDQgNDkuMDYwMiA2LjUxOTEyIDQ4LjI4NzFMMi4wMTAxMSA0My43Njg3QzAuMDgyNDUwMyA0MS44MzYyIDAuMDg3Nzg0NCAzOS42NDA5IDAuMDkwMTUyNCAzOC43NjY2QzAuMDkwMjMwOSAzOC43Mzc2IDAuMDkwMzA1NSAzOC43MSAwLjA5MDMwNTUgMzguNjg0VjE0LjYxMjdDMC4wNzA0MyAxMy4xMDI1IDAuNDcwNjMgMTEuNjE1NyAxLjI0NzI5IDEwLjMxOTJDMi4wMzEzOSA5LjAxMDE4IDMuMTY3OTIgNy45NDczOCA0LjUyODExIDcuMjUzNUw0LjY1Njk3IDcuMTg3NzZMMTguOTcyOCAxLjE0NDg5QzIwLjM4MzUgMC40NzQ4MDggMjEuOTE2MiAwLjA5OTE5NTUgMjMuNDc3OCAwLjA0MTc2NUwyMy41NTEzIDAuMDM5MDYyNVoiIGZpbGw9IiMwRjE0MTAiLz4KPHBhdGggZD0iTTIyLjI4NjMgMjIuOTcyOUg0NS42NDdWMTcuMDcxN0gyMi4yOTIyQzIyLjI5MjIgMTcuNjc0NiAyMi4yODYzIDIyLjk3MjkgMjIuMjg2MyAyMi45NzI5WiIgZmlsbD0iI0ZCQ0I0QSIvPgo8cGF0aCBkPSJNNjEuODMzNCAxMC44MTY3TDQ3LjU1OTEgNC43OTIxM0M0Ni42MjA4IDQuMzMzODggNDUuNTk3NCA0LjA3NzM3IDQ0LjU1NDQgNC4wMzkwNkgyMy42MjQ4QzIyLjU4MTIgNC4wNzc0NCAyMS41NTcxIDQuMzMzOTQgMjAuNjE4MiA0Ljc5MjEzTDYuMzQ1NzkgMTAuODE2N0M1LjY1NTMgMTEuMTY4OSA1LjA3NzYxIDExLjcwODggNC42Nzg3NiAxMi4zNzQ3QzQuMjc5OSAxMy4wNDA1IDQuMDc1OTggMTMuODA1NCA0LjA5MDMxIDE0LjU4MlYzOC42ODRDNC4wOTAzMSAzOS40MzcxIDQuMDkwMyA0MC4xOTAxIDQuODQxNDggNDAuOTQzMkw5LjM1MDQ5IDQ1LjQ2MTZDMTAuMTAxNyA0Ni4yMTQ3IDEwLjY2NTUgNDYuMjE0NyAxMS42MDQgNDYuMjE0N0gyMS45MjkzQzIxLjkyOTMgNDYuODYyMSAyMS45MjkzIDUyLjIzNTMgMjEuOTI5MyA1Mi4yMzUzSDQ2LjMzNzdWNDYuMjA2OUgyMS45NDg4VjQwLjE5MDFIMTAuODUyOEMxMC4xMDE3IDQwLjE5MDEgMTAuMTAxNyAzOS40MzcxIDEwLjEwMTcgMzkuNDM3MVYxMC44MTY3QzEwLjEwMTcgMTAuODE2NyAxMC4xMDE3IDEwLjA2MzYgMTAuODUyOCAxMC4wNjM2SDU3LjMyODNDNTguMDc5NSAxMC4wNjM2IDU4LjA3OTUgMTAuODE2NyA1OC4wNzk1IDEwLjgxNjdWMzkuNDM3MUM1OC4wNzk1IDM5LjQzNzEgNTguMDc5NSA0MC4xOTAxIDU3LjMyODMgNDAuMTkwMUg0Ni4zNDM2TDQ2LjMzNzcgNDYuMjA2OUw1Ni41NzcxIDQ2LjIxNDdDNTcuNTE1NiA0Ni4yMTQ3IDU4LjA3OTUgNDYuMjE0NyA1OC44MzA3IDQ1LjQ2MTZMNjMuMzM3NyA0MC45NDMyQzY0LjA4ODkgNDAuMTkwMSA2NC4wODg5IDM5LjQzNzEgNjQuMDg4OSAzOC42ODRWMTQuNTgyQzY0LjEwMyAxMy44MDU1IDYzLjg5OSAxMy4wNDA2IDYzLjUwMDEgMTIuMzc0OEM2My4xMDEzIDExLjcwOSA2Mi41MjM4IDExLjE2OTEgNjEuODMzNCAxMC44MTY3WiIgZmlsbD0iI0ZCQ0I0QSIvPgo8L3N2Zz4K";
    public provider = providers[constants.StarknetChainId.MAINNET];
    public isConnected: boolean = false;
    public account?: AccountInterface | undefined;
    public selectedAddress?: string;
    public subscriptions: WalletEvents[] = [];

    private controller: Controller;

    constructor(policies?: Policy[],
        options?: {
            url?: string;
            origin?: string;
            starterPackId?: string;
        }) {
        this.controller = new Controller(policies, options);
        this.controller.ready().then(isConnected => {
            this.isConnected = !!isConnected;
            if (this.controller.account) {
                this.account = this.controller.account;
                this.provider = providers[this.controller.chainId];
                this.selectedAddress = this.account.address;
            }
        })
    }

    request = (call: Omit<RpcMessage, "result">): Promise<RpcMessage["result"]> => {
        throw Error("Not implemented")
    }

    enable = async (): Promise<string[]> => {
        this.account = await this.controller.connect()
        if (!this.account) {
            return [];
        }

        this.provider = providers[this.controller.chainId];
        this.isConnected = true;
        return [this.account.address];
    }

    isPreauthorized = async (): Promise<boolean> => {
        return this.controller
            .ready()
            .then(() => {
                return this.controller.probe();
            })
            .then((connected) => !!connected);
    };

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
    };

    off = (type: EventType, handler: EventHandler): void => {
        if (type !== "accountsChanged" && type !== "networkChanged") {
            throw new Error(`Unknwown event: ${type}`);
        }

        const idx = this.subscriptions.findIndex(
            (userEvent) => userEvent.type === type && userEvent.handler === handler
        );

        if (idx >= 0) {
            this.subscriptions.splice(idx, 1);
        }
    };
}

function injectController(policies?: Policy[],
    options?: {
        url?: string;
        origin?: string;
        starterPackId?: string;
    }) {
    (window as any).starknet_cartridge = new InjectedController(policies, options);
}

export { injectController };
