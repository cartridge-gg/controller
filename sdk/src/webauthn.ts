import {
    Abi,
    Invocation,
    InvocationsSignerDetails,
    Signature,
    SignerInterface,
    transaction,
    hash,
    number,
    typedData,
} from "starknet";
import base64url from "base64url";

const BASE = number.toBN(2).pow(86);

type Assertion = PublicKeyCredential & {
    response: AuthenticatorAssertionResponse;
}

function split(n: number.BigNumberish): { x: number.BigNumberish; y: number.BigNumberish; z: number.BigNumberish } {
    const x = n.mod(BASE);
    const y = n.div(BASE).mod(BASE);
    const z = n.div(BASE).div(BASE);
    return { x, y, z };
}

function convertUint8ArrayToWordArray(u8Array) {
    var words = [], i = 0, len = u8Array.length;

    while (i < len) {
        words.push((
            (u8Array[i++] << 24) |
            (u8Array[i++] << 16) |
            (u8Array[i++] << 8) |
            (u8Array[i++])) >>> 0
        );
    }

    return {
        sigBytes: words.length * 4,
        words: words
    };
}

export class WebauthnSigner implements SignerInterface {
    private credentialId: string;
    private publicKey: string;

    constructor(credentialId: string, publicKey: string) {
        this.credentialId = credentialId;
        this.publicKey = publicKey;
    }

    public async getPubKey(): Promise<string> {
        return this.publicKey;
    }

    public async sign(hash: string): Promise<Assertion> {
        const challenge = Buffer.from(hash.slice(2).padStart(64, '0').slice(0, 64), 'hex')
        return (await navigator.credentials.get({
            publicKey: {
                challenge,
                timeout: 60000,
                rpId: "cartridge.gg",
                allowCredentials: [
                    {
                        type: "public-key",
                        id: base64url.toBuffer(this.credentialId),
                    },
                ],
                userVerification: "required",
            },
        })) as unknown as PublicKeyCredential & {
            response: AuthenticatorAssertionResponse;
        }
    }

    formatAssertion(assertion: Assertion): Signature {
        var authenticatorDataBytes = new Uint8Array(
            assertion.response.authenticatorData,
        );

        const authenticatorDataRem = authenticatorDataBytes.length % 4
        const authenticatorDataWords = convertUint8ArrayToWordArray(authenticatorDataBytes).words

        var clientDataJSONBytes = new Uint8Array(
            assertion.response.clientDataJSON,
        );
        const clientDataJSONRem = clientDataJSONBytes.length % 4
        const clientDataWords = convertUint8ArrayToWordArray(clientDataJSONBytes).words

        // Convert signature from ASN.1 sequence to "raw" format
        const usignature = new Uint8Array(assertion.response.signature);
        const rStart = usignature[4] === 0 ? 5 : 4;
        const rEnd = rStart + 32;
        const sStart = usignature[rEnd + 2] === 0 ? rEnd + 3 : rEnd + 2;

        const r = number.toBN(
            "0x" + Buffer.from(usignature.slice(rStart, rEnd)).toString("hex"),
        );
        const s = number.toBN(
            "0x" + Buffer.from(usignature.slice(sStart)).toString("hex"),
        );

        const { x: r0, y: r1, z: r2 } = split(r);
        const { x: s0, y: s1, z: s2 } = split(s);

        return [
            "0",
            r0.toString(), r1.toString(), r2.toString(),
            s0.toString(), s1.toString(), s2.toString(),
            "9", "0",
            `${clientDataWords.length}`, `${clientDataJSONRem}`, ...clientDataWords.map(word => `${word}`),
            `${authenticatorDataWords.length}`, `${authenticatorDataRem}`, ...authenticatorDataWords.map(word => `${word}`),
        ];
    }

    public hashTransaction(
        transactions: Invocation[],
        transactionsDetail: InvocationsSignerDetails,
        abis?: Abi[],
    ): string {
        if (abis && abis.length !== transactions.length) {
            throw new Error(
                "ABI must be provided for each transaction or no transaction",
            );
        }
        // now use abi to display decoded data somewhere, but as this signer is headless, we can't do that

        const calldata = transaction.fromCallsToExecuteCalldataWithNonce(
            transactions,
            transactionsDetail.nonce,
        );

        return hash.calculcateTransactionHash(
            transactionsDetail.walletAddress,
            transactionsDetail.version,
            hash.getSelectorFromName("__execute__"),
            calldata,
            transactionsDetail.maxFee,
            transactionsDetail.chainId,
        );
    }

    public async signTransaction(
        transactions: Invocation[],
        transactionsDetail: InvocationsSignerDetails,
        abis?: Abi[],
    ): Promise<Signature> {
        if (abis && abis.length !== transactions.length) {
            throw new Error(
                "ABI must be provided for each transaction or no transaction",
            );
        }
        // now use abi to display decoded data somewhere, but as this signer is headless, we can't do that

        const calldata = transaction.fromCallsToExecuteCalldataWithNonce(
            transactions,
            transactionsDetail.nonce,
        );

        const msgHash = hash.calculcateTransactionHash(
            transactionsDetail.walletAddress,
            transactionsDetail.version,
            hash.getSelectorFromName("__execute__"),
            calldata,
            transactionsDetail.maxFee,
            transactionsDetail.chainId,
        );

        const assertion = await this.sign(msgHash);
        return this.formatAssertion(assertion)
    }

    public async signMessage(
        td: typedData.TypedData,
        accountAddress: string,
    ): Promise<Signature> {
        const msgHash = typedData.getMessageHash(td, accountAddress);
        const assertion = await this.sign(msgHash);
        return this.formatAssertion(assertion)
    }
}
