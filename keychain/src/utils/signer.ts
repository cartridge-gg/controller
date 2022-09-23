import {
    Abi,
    Call,
    InvocationsSignerDetails,
    Signature,
    KeyPair,
    Signer,
    typedData,
} from "starknet";

export class DeviceSigner extends Signer {
    constructor(keyPair: KeyPair) {
        super(keyPair);
    }

    public async signTransaction(
        calls: Call[],
        transactionsDetail: InvocationsSignerDetails,
        abis?: Abi[],
    ): Promise<Signature> {
        const sig = await super.signTransaction(
            calls,
            transactionsDetail,
            abis,
        );
        const pub = await this.getPubKey();
        return [pub, ...(sig as string[])];
    }

    public async signMessage(
        typedData: typedData.TypedData,
        accountAddress: string,
    ): Promise<Signature> {
        const sig = await super.signMessage(typedData, accountAddress);
        const pub = await this.getPubKey();
        return [pub, ...(sig as string[])];
    }
}
