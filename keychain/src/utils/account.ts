import { constants, hash, number, Account as BaseAccount, RpcProvider, SignerInterface } from "starknet"

import { CONTROLLER_CLASS } from "./constants";
import Storage from "./storage";

class Account extends BaseAccount {
    private rpc: RpcProvider;
    deployed: boolean = false;
    registered: boolean = false;

    constructor(chainId: constants.StarknetChainId, nodeUrl: string, address: string, signer: SignerInterface) {
        super({ rpc: { nodeUrl } }, address, signer);
        this.rpc = new RpcProvider({ nodeUrl });
        const state = Storage.get(`@deployment/${chainId}`)
        if (!state || state.syncing === undefined) {
            this.sync(chainId);
            return;
        }

        this.deployed = state.deployed;
        this.registered = state.registered;
    }

    async sync(chainId: constants.StarknetChainId) {
        Storage.update(`@deployment/${chainId}`, {
            syncing: true,
        });

        try {
            const classHash = await this.rpc.getClassHashAt("latest", this.address)
            Storage.update(`@deployment/${chainId}`, {
                classHash,
                deployed: true,
            })
            this.deployed = true;

            const nonce = await this.rpc.getNonceForAddress(this.address, "latest");
            Storage.update(`@deployment/${chainId}`, {
                nonce,
            })

            const pub = await this.signer.getPubKey();
            const res = await this.rpc.callContract({
                contractAddress: this.address,
                entrypoint: "executeOnPlugin",
                calldata: [
                    CONTROLLER_CLASS, hash.getSelector("is_public_key"), "0x1", pub,
                ],
            }, "latest");
            this.registered = res.result[1] === "0x01";
            Storage.update(`@deployment/${chainId}`, {
                registered: this.registered,
            })
        } catch (e) {
            /* no-op */
        }

        Storage.update(`@deployment/${chainId}`, {
            syncing: false,
        });
    }

    async getNonce(blockIdentifier?: any): Promise<number.BigNumberish> {
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
