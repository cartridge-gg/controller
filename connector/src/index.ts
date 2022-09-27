import { Connector } from "@starknet-react/core";
import Controller, { Scope } from "@cartridge/controller";
import { AccountInterface } from "starknet";

class ControllerConnector extends Connector {
    private controller: Controller;
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
        this.controller = new Controller(scopes, options);
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
        const ready = await this.controller.ready();
        if (ready) {
            const account = await this.controller.probe();
            return !!account;
        }

        return false;
    }

    async register(address: string) {
        return this.controller.register(address);
    }

    async connect(): Promise<AccountInterface> {
        this._account = await this.controller.connect();
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

export default ControllerConnector;