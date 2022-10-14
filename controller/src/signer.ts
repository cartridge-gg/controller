import {
    Abi,
    InvocationsSignerDetails,
    SignerInterface,
    Signature,
    typedData,
    Call,
    DeclareSignerDetails
} from "starknet";
import qs from 'query-string';

import { Keychain } from "./types";
import { AsyncMethodReturns } from "@cartridge/penpal";
import { calculateDeclareTransactionHash } from "starknet/dist/utils/hash";

export class Signer implements SignerInterface {
    private keychain: AsyncMethodReturns<Keychain>;
    private url: string = "https://cartridge.gg";

    constructor(keychain: AsyncMethodReturns<Keychain>, options?: {
        url?: string;
    }) {
        this.keychain = keychain;

        if (options?.url) {
            this.url = options.url;
        }
    }

    /**
     * Method to get the public key of the signer
     *
     * @returns public key of signer as hex string with 0x prefix
     */
    public getPubKey(): Promise<string> {
        return Promise.resolve("")
    }

    /**
     * Sign an JSON object for off-chain usage with the starknet private key and return the signature
     * This adds a message prefix so it cant be interchanged with transactions
     *
     * @param typedData - JSON object to be signed
     * @param accountAddress - account
     * @returns the signature of the JSON object
     * @throws {Error} if the JSON object is not a valid JSON
     */
    public async signMessage(typedData: typedData.TypedData, account: string): Promise<Signature> {
        window.open(
            `${this.url}/sign?${qs.stringify({
                origin: window.origin,
                message: JSON.stringify(typedData.message),
            })}`,
            "_blank",
            "height=650,width=400"
        );

        return this.keychain.signMessage(typedData, account);
    }

    /**
     * Signs a transaction with the starknet private key and returns the signature
     *
     * @param invocation the invocation object containing:
     * - contractAddress - the address of the contract
     * - entrypoint - the entrypoint of the contract
     * - calldata - (defaults to []) the calldata
     * - signature - (defaults to []) the signature
     * @param abi (optional) the abi of the contract for better displaying
     *
     * @returns signature
     */
    public async signTransaction(
        calls: Call[],
        transactionsDetail: InvocationsSignerDetails,
        abis?: Abi[]
    ): Promise<Signature> {
        window.open(
            `${this.url}/sign?${qs.stringify({
                origin: window.origin,
                calls: JSON.stringify(calls),
            })}`,
            "_blank",
            "height=650,width=400"
        );

        return this.keychain.signTransaction(calls, transactionsDetail, abis);
    }

    public async signDeclareTransaction(
        // contractClass: ContractClass,  // Should be used once class hash is present in ContractClass
        details: DeclareSignerDetails
    ) {
        return this.keychain.signDeclareTransaction(details);
    }
}
