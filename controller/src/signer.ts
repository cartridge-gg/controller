import {
    Abi,
    Invocation,
    InvocationsSignerDetails,
    SignerInterface,
    Signature,
    typedData
} from "starknet";
import qs from 'query-string';
import cuid from "cuid";

import { Messenger } from "./messenger";
import {
    SignMessageResponse,
    SignTransactionResponse,
} from "./types";

export class Signer implements SignerInterface {
    private messenger: Messenger;
    private url: string = "https://cartridge.gg";

    constructor(messenger: Messenger, options?: {
        url?: string;
    }) {
        this.messenger = messenger;

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
        const id = cuid()

        window.open(
            `${this.url}/sign?${qs.stringify({
                id,
                origin: window.origin,
                message: JSON.stringify(typedData.message),
            })}`,
            "_blank",
            "height=650,width=400"
        );

        const response = await this.messenger.send<SignMessageResponse>({
            method: "sign-message",
            params: {
                id,
                account,
                typedData,
            },
        });

        if (response.error) {
            throw new Error(response.error as string);
        }

        return response.result!;
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
        transactions: Invocation[],
        transactionsDetail: InvocationsSignerDetails,
        abis?: Abi[]
    ): Promise<Signature> {
        const id = cuid()
        const calls = Array.isArray(transactions) ? transactions : [transactions];

        window.open(
            `${this.url}/sign?${qs.stringify({
                id,
                origin: window.origin,
                calls: JSON.stringify(calls),
            })}`,
            "_blank",
            "height=650,width=400"
        );

        const response = await this.messenger.send<SignTransactionResponse>({
            method: "sign-transaction",
            params: {
                id,
                transactions,
                abis,
                transactionsDetail,
            },
        });

        if (response.error) {
            throw new Error(response.error as string);
        }

        return response.result!;
    }
}
