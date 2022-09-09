import {
    ec,
    Account,
    defaultProvider,
    KeyPair,
    number,
} from "starknet";
import { BigNumberish } from "starknet/utils/number";
import { Scope, Approvals } from "@cartridge/sdk";
import equal from "fast-deep-equal";

import Storage from "utils/storage";
import { ControllerState } from "hooks/controller";
import { DeviceSigner } from "./signer";

export default class Controller extends Account {
    public accountId: string;
    public transaction: string;
    protected publicKey: string;
    protected keypair: KeyPair;

    constructor(
        accountId: string,
        keypair: KeyPair,
        address: string,
        transaction: string,
    ) {
        super(defaultProvider, address, keypair);
        this.signer = new DeviceSigner(keypair);
        this.accountId = accountId;
        this.keypair = keypair;
        this.publicKey = ec.getStarkKey(keypair);
        this.transaction = transaction;
    }

    async checkDeployment(): Promise<ControllerState> {
        const controller = Storage.get("controller");
        let state: ControllerState = ControllerState.DEPLOYING;

        if (controller.transaction) {
            const { status } = await this.getTransactionReceipt(
                controller.transaction,
            );
            switch (status) {
                case "ACCEPTED_ON_L2":
                case "ACCEPTED_ON_L1":
                    state = ControllerState.READY;
                    break;
                default:
                    state = ControllerState.DEPLOYING;
            }
        } else {
            state =
                (await this.getCode(this.address)).bytecode.length > 0
                    ? ControllerState.READY
                    : ControllerState.DEPLOYING;
        }

        return state;
    }

    cache() {
        return Storage.set("controller", {
            accountId: this.accountId,
            privateKey: number.toHex(this.keypair.priv),
            publicKey: this.publicKey,
            address: this.address,
            transaction: this.transaction,
        });
    }

    async approve(origin: string, scopes: Scope[], maxFee?: BigNumberish) {
        const value: Approvals = {
            [origin]: {
                scopes,
                maxFee,
            },
        };
        const raw = Storage.get("approvals");
        if (raw) {
            value[origin] = { scopes, maxFee };
        }

        Storage.set("approvals", value);
    }

    async unapprove(origin: string) {
        const approvals = Storage.get("approvals");
        delete approvals[origin];

        Storage.set("approvals", approvals);
    }

    async approval(
        origin: string,
    ): Promise<{ scopes: Scope[]; maxFee: BigNumberish } | undefined> {
        const approvals = await this.approvals();
        if (!approvals) {
            return;
        }

        const url = new URL(origin);
        return approvals[url.href];
    }

    async approvals(): Promise<Approvals | undefined> {
        const raw = Storage.get("approvals");
        if (!raw) {
            return;
        }
        return raw as Approvals;
    }

    static async fromStore() {
        const controller = Storage.get("controller");
        if (!controller) {
            return null;
        }

        const { accountId, privateKey, address, transaction } = controller;
        const keypair = ec.getKeyPair(privateKey);
        return new Controller(accountId, keypair, address, transaction);
    }
}

export function diff(a: Scope[], b: Scope[]): Scope[] {
    return a.reduce(
        (prev, scope) =>
            b.some((approval) => equal(approval, scope)) ? prev : [...prev, scope],
        [] as Scope[],
    );
}
