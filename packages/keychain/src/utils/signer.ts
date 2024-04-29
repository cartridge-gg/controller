import {
  Call,
  InvocationsSignerDetails,
  Signature,
  Signer,
  TypedData,
} from "starknet";
// import { CLASS_HASHES } from "@cartridge/controller/src/constants";

export class DeviceSigner extends Signer {
  constructor(privateKey: string) {
    super(privateKey);
  }

  public async signTransaction(
    calls: Call[],
    transactionsDetail: InvocationsSignerDetails,
  ): Promise<Signature> {
    return super.signTransaction(calls, transactionsDetail);
    // TODO: properly remove this
    // const sig = await super.signTransaction(calls, transactionsDetail);
    // const pub = await this.getPubKey();
    // return [
    //   BigInt(CLASS_HASHES["0.0.1"].controller).toString(),
    //   BigInt(pub).toString(),
    //   ...(sig as string[]),
    // ];
  }

  public async signMessage(
    typedData: TypedData,
    accountAddress: string,
  ): Promise<Signature> {
    return super.signMessage(typedData, accountAddress);
    // TODO: properly remove this
    // const sig = await super.signMessage(typedData, accountAddress);
    // const pub = await this.getPubKey();
    // return [
    //   BigInt(CLASS_HASHES["0.0.1"].controller).toString(),
    //   BigInt(pub).toString(),
    //   ...(sig as string[]),
    // ];
  }
}
