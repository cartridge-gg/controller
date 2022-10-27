import { Connector } from "@starknet-react/core";
import Controller, { Assertion, Policy } from "@cartridge/controller";
import { AccountInterface, InvokeFunctionResponse } from "starknet";

class ControllerConnector extends Connector {
    public controller: Controller;
    private _account: AccountInterface | null;

    constructor(
        policies?: Policy[],
        options?: {
            url?: string;
            origin?: string;
        },
    ) {
        super({ options });
        this._account = null;
        this.controller = new Controller(policies, options);
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
        return await this.controller.ready()
    }

    async register(username: string, credential: { x: string, y: string }) {
        return this.controller.register(username, credential);
    }

    async login(address: string, credentialId: string, options: {
        rpId?: string
        challengeExt?: Buffer
    }): Promise<{ assertion: Assertion, transactionHash: string } | null> {
        return this.controller.login(address, credentialId, options);
    }

    async provision(address: string) {
        return this.controller.provision(address);
    }

    async connect(): Promise<AccountInterface> {
        this._account = await this.controller.connect();
        if (!this._account) {
            throw new Error("account not found")
        }
        return this._account;
    }

    async disconnect(): Promise<void> {
        return this.controller.disconnect();
    }

    account() {
        return Promise.resolve(this._account);
    }
}

export default ControllerConnector;
