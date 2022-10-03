import {
    ec,
    Account,
    defaultProvider,
    KeyPair,
    number,
} from "starknet";
import { BigNumberish } from "starknet/utils/number";
import { Scope, Approvals } from "@cartridge/controller";
import equal from "fast-deep-equal";

import Storage from "utils/storage";
import { DeviceSigner } from "./signer";

export default class Controller extends Account {
    protected publicKey: string;
    protected keypair: KeyPair;

    constructor(
        keypair: KeyPair,
        address: string,
    ) {
        super(defaultProvider, address, keypair);
        this.signer = new DeviceSigner(keypair);
        this.keypair = keypair;
        this.publicKey = ec.getStarkKey(keypair);
    }

    cache() {
        return Storage.set("controller", {
            privateKey: number.toHex(this.keypair.priv),
            publicKey: this.publicKey,
            address: this.address,
        });
    }

    approve(origin: string, scopes: Scope[], maxFee?: BigNumberish) {
        const value: { [origin: string]: Approvals } = {
            [origin]: {
                scopes,
                maxFee,
            },
        };
        const raw = Storage.get("approvals");
        if (raw) {
            value[origin] = { scopes, maxFee };
        }
        console.log(origin)
        Storage.set("approvals", value);
    }

    unapprove(origin: string) {
        const approvals = Storage.get("approvals");
        delete approvals[origin];
        Storage.set("approvals", approvals);
    }

    approval(
        origin: string,
    ): { scopes: Scope[]; maxFee: BigNumberish } | undefined {
        const approvals = this.approvals();
        if (!approvals) {
            return;
        }

        return approvals[origin];
    }

    approvals(): Approvals | undefined {
        const raw = Storage.get("approvals");
        if (!raw) {
            return;
        }
        return raw as Approvals;
    }

    static fromStore() {
        const controller = Storage.get("controller");
        if (!controller) {
            return null;
        }

        const { privateKey, address } = controller;
        const keypair = ec.getKeyPair(privateKey);
        return new Controller(keypair, address);
    }
}

export function diff(a: Scope[], b: Scope[]): Scope[] {
    return a.reduce(
        (prev, scope) =>
            b.some((approval) => equal(approval, scope)) ? prev : [...prev, scope],
        [] as Scope[],
    );
}
