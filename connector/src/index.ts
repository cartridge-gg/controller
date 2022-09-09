import { Connector } from "@starknet-react/core";
import { Cartridge, Scope } from "@cartridge/controller";
import { AccountInterface } from "starknet";

export class CartridgeConnector extends Connector {
    private cartridge: Cartridge;
    private _account?: AccountInterface;

    constructor(
        scopes?: Scope[],
        options?: {
            url?: string;
            origin?: string;
        },
    ) {
        super({ options });
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

    async connect() {
        this._account = await this.cartridge.connect();
        return this._account;
    }

    async disconnect(): Promise<void> {
        return Promise.resolve();
    }

    account() {
        return this._account
            ? Promise.resolve(this._account)
            : Promise.reject(this._account);
    }
}
