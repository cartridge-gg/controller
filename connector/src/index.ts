import { Connector } from "@starknet-react/core";
import { Cartridge, Scope } from "@cartridge/controller/src";
import { AccountInterface } from "starknet";

export class CartridgeConnector extends Connector {
    private cartridge: Cartridge;
    private _account: AccountInterface | null;

    constructor(
        scopes?: Scope[],
        options?: {
            url?: string;
            origin?: string;
        },
    ) {
        super({ options });
        this._account = null;
        this.cartridge = new Cartridge(scopes, options);
    }

    id() {
        return "cartridge";
    }

    name() {
        return "Cartridge";
    }

    available(): boolean {
        return true;
    }

    async ready() {
        const ready = await this.cartridge.ready();
        if (ready) {
            const account = await this.cartridge.probe();
            return !!account;
        }

        return false;
    }

    async register(username: string, password: string) {
        return this.cartridge.register(username, password);
    }

    async connect(): Promise<AccountInterface> {
        this._account = await this.cartridge.connect();
        if (!this._account) {
            throw new Error("account not found")
        }
        return this._account;
    }

    async disconnect(): Promise<void> {
        return Promise.resolve();
    }

    account() {
        return Promise.resolve(this._account);
    }
}
