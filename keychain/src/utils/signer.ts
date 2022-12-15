import {
  number,
  Abi,
  Call,
  InvocationsSignerDetails,
  Signature,
  KeyPair,
  Signer,
  typedData,
} from "starknet";
import { CLASS_HASHES } from "./hashes";

export class DeviceSigner extends Signer {
  constructor(keyPair: KeyPair) {
    super(keyPair);
  }

  public async signTransaction(
    calls: Call[],
    transactionsDetail: InvocationsSignerDetails,
    abis?: Abi[],
  ): Promise<Signature> {
    const sig = await super.signTransaction(calls, transactionsDetail, abis);
    const pub = await this.getPubKey();
    return [
      number.toBN(CLASS_HASHES["0.0.1"].controller).toString(),
      number.toBN(pub).toString(),
      ...(sig as string[]),
    ];
  }

  public async signMessage(
    typedData: typedData.TypedData,
    accountAddress: string,
  ): Promise<Signature> {
    const sig = await super.signMessage(typedData, accountAddress);
    const pub = await this.getPubKey();
    return [
      number.toBN(CLASS_HASHES["0.0.1"].controller).toString(),
      number.toBN(pub).toString(),
      ...(sig as string[]),
    ];
  }
}
