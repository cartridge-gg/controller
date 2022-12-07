import { Account as BaseAccount, RpcProvider, SignerInterface } from "starknet"
import { getSelector } from "starknet/utils/hash";
import { BigNumberish } from "starknet/utils/number";
import { CONTROLLER_CLASS } from "./constants";
import Storage from "./storage";

class Account extends BaseAccount {
    private rpc: RpcProvider;
    deployed: boolean = false;
    registered: boolean = false;

    constructor(rpc: RpcProvider, address: string, signer: SignerInterface) {
        super(rpc, address, signer);
        this.rpc = rpc;
        this.sync();
    }

    async sync() {
        const chainId = await this.rpc.getChainId();

        const existing = Storage.get(`@deployment/${chainId}`);
        if (existing && existing.syncing !== undefined) {
            return;
        }
        Storage.update(`@deployment/${chainId}`, {
            syncing: true,
        });

        try {
            const classHash = await this.rpc.getClassHashAt("latest", this.address)
            Storage.update(`@deployment/${chainId}`, {
                classHash,
            })
            this.deployed = true;

            const nonce = await this.rpc.getNonce(this.address, "latest");
            Storage.update(`@deployment/${chainId}`, {
                nonce,
            })

            const pub = await this.signer.getPubKey();
            const res = await this.rpc.callContract({
                contractAddress: this.address,
                entrypoint: "executeOnPlugin",
                calldata: [
                    CONTROLLER_CLASS, getSelector("is_public_key"), "0x1", pub,
                ],
            }, "latest");
            this.registered = res[1] === "0x1";
            Storage.update(`@deployment/${chainId}`, {
                registered: this.registered,
            })
        } catch (e) {
            console.error(e)
            /* no-op */
        }

        Storage.update(`@deployment/${chainId}`, {
            syncing: false,
        });
    }

    async getNonce(blockIdentifier?: any): Promise<BigNumberish> {
        if (blockIdentifier && blockIdentifier !== "latest") {
            return super.getNonce(blockIdentifier);
        }

        const deployment = Storage.get(`@deployment/${this.rpc.chainId}`);

        if (!deployment || !deployment.nonce) {
            return "0x0";
        }

        return deployment.nonce;
    }
}

export default Account;