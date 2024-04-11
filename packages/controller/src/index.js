import { constants, RpcProvider } from "starknet";
import { connectToChild, } from "@cartridge/penpal";
import DeviceAccount from "./device";
import { ResponseCodes, } from "./types";
import { createModal } from "./modal";
export const providers = {
    [constants.StarknetChainId.SN_MAIN]: new RpcProvider({
        nodeUrl: process.env.NEXT_PUBLIC_RPC_MAINNET,
    }),
    [constants.StarknetChainId.SN_SEPOLIA]: new RpcProvider({
        nodeUrl: process.env.NEXT_PUBLIC_RPC_SEPOLIA,
    }),
};
class Controller {
    constructor(policies, options) {
        this.policies = [];
        this.url = "https://x.cartridge.gg";
        this.chainId = constants.StarknetChainId.SN_SEPOLIA;
        if (policies) {
            this.policies = policies;
        }
        if (options?.chainId) {
            this.chainId = options.chainId;
        }
        if (options?.starterPackId) {
            this.starterPackId = options.starterPackId;
        }
        if (options?.url) {
            this.url = options.url;
        }
        if (typeof document === "undefined") {
            return;
        }
        this.modal = createModal(this.url, () => {
            this.keychain?.reset();
        });
        if (document.readyState === "complete" ||
            document.readyState === "interactive") {
            document.body.appendChild(this.modal.element);
        }
        else {
            document.addEventListener("DOMContentLoaded", () => {
                document.body.appendChild(this.modal.element);
            });
        }
        this.connection = connectToChild({
            iframe: this.modal.element.children[0],
        });
        this.connection.promise
            .then((keychain) => (this.keychain = keychain))
            .then(() => this.probe());
    }
    get account() {
        if (!this.accounts) {
            return;
        }
        return this.accounts[this.chainId];
    }
    ready() {
        return (this.connection?.promise
            .then(() => this.probe())
            .then((res) => !!res, () => false) ?? Promise.resolve(false));
    }
    async probe() {
        if (!this.keychain || !this.modal) {
            console.error("not ready for connect");
            return null;
        }
        try {
            const res = await this.keychain.probe();
            if (res.code !== ResponseCodes.SUCCESS) {
                return;
            }
            const { address } = res;
            this.accounts = {
                [constants.StarknetChainId.SN_MAIN]: new DeviceAccount(providers[constants.StarknetChainId.SN_MAIN], address, this.keychain, this.modal),
                [constants.StarknetChainId.SN_SEPOLIA]: new DeviceAccount(providers[constants.StarknetChainId.SN_SEPOLIA], address, this.keychain, this.modal),
            };
        }
        catch (e) {
            console.error(e);
            return;
        }
        return !!this.accounts[this.chainId];
    }
    async switchChain(chainId) {
        if (this.chainId === chainId) {
            return;
        }
        this.chainId = chainId;
    }
    // Register a new device key.
    async register(username, credentialId, credential) {
        if (!this.keychain) {
            console.error("not ready for connect");
            return null;
        }
        return await this.keychain.register(username, credentialId, credential);
    }
    async login(address, credentialId, options) {
        if (!this.keychain) {
            console.error("not ready for connect");
            return null;
        }
        return this.keychain.login(address, credentialId, options);
    }
    async provision(address, credentialId) {
        if (!this.keychain) {
            console.error("not ready for connect");
            return null;
        }
        return this.keychain.provision(address, credentialId);
    }
    async issueStarterPack(id) {
        if (!this.keychain || !this.modal) {
            console.error("not ready for connect");
            return;
        }
        this.modal.open();
        try {
            if (!this.account) {
                let response = await this.keychain.connect(this.policies, undefined, this.chainId);
                if (response.code !== ResponseCodes.SUCCESS) {
                    throw new Error(response.message);
                }
            }
            return await this.keychain.issueStarterPack(id);
        }
        catch (e) {
            console.log(e);
        }
        finally {
            this.modal.close();
        }
    }
    async showQuests(gameId) {
        if (!this.keychain || !this.modal) {
            console.error("not ready for connect");
            return;
        }
        this.modal.open();
        try {
            return await this.keychain.showQuests(gameId);
        }
        catch (e) {
            console.error(e);
        }
        finally {
            this.modal.close();
        }
    }
    async connect() {
        if (this.accounts) {
            return this.accounts[this.chainId];
        }
        if (!this.keychain || !this.modal) {
            console.error("not ready for connect");
            return;
        }
        if (!!document.hasStorageAccess) {
            const ok = await document.hasStorageAccess();
            if (!ok) {
                await document.requestStorageAccess();
            }
        }
        this.modal.open();
        try {
            let response = await this.keychain.connect(this.policies, undefined, this.chainId);
            if (response.code !== ResponseCodes.SUCCESS) {
                throw new Error(response.message);
            }
            response = response;
            this.accounts = {
                [constants.StarknetChainId.SN_MAIN]: new DeviceAccount(providers[constants.StarknetChainId.SN_MAIN], response.address, this.keychain, this.modal),
                [constants.StarknetChainId.SN_SEPOLIA]: new DeviceAccount(providers[constants.StarknetChainId.SN_SEPOLIA], response.address, this.keychain, this.modal),
            };
            return this.accounts[this.chainId];
        }
        catch (e) {
            console.log(e);
        }
        finally {
            this.modal.close();
        }
    }
    async disconnect() {
        if (!this.keychain) {
            console.error("not ready for disconnect");
            return null;
        }
        if (!!document.hasStorageAccess) {
            const ok = await document.hasStorageAccess();
            if (!ok) {
                await document.requestStorageAccess();
            }
        }
        return await this.keychain.disconnect();
    }
    revoke(origin, policy) {
        if (!this.keychain) {
            console.error("not ready for disconnect");
            return null;
        }
        return this.keychain.revoke(origin);
    }
    async approvals(origin) {
        if (!this.keychain) {
            console.error("not ready for disconnect");
            return;
        }
        return this.keychain.approvals(origin);
    }
}
export * from "./types";
export * from "./errors";
export { computeAddress, split, verifyMessageHash } from "./utils";
export { injectController } from "./inject";
export default Controller;
//# sourceMappingURL=index.js.map