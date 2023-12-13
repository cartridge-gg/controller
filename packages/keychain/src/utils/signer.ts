import {
  Abi,
  Call,
  InvocationsSignerDetails,
  Signature,
  Signer,
  typedData,
} from "starknet";
import { CLASS_HASHES } from "@cartridge/controller/src/constants";

export class DeviceSigner extends Signer {
  constructor(privateKey: string) {
    super(privateKey);
  }

  public async signTransaction(
    calls: Call[],
    transactionsDetail: InvocationsSignerDetails,
    abis?: Abi[],
  ): Promise<Signature> {
    const sig = await super.signTransaction(calls, transactionsDetail, abis);
    const pub = await this.getPubKey();
    return [
      BigInt(CLASS_HASHES["0.0.1"].controller).toString(),
      BigInt(pub).toString(),
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
      BigInt(CLASS_HASHES["0.0.1"].controller).toString(),
      BigInt(pub).toString(),
      ...(sig as string[]),
    ];
  }
}
