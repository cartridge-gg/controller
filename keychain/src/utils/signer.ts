import {
  Abi,
  Call,
  InvocationsSignerDetails,
  Signature,
  KeyPair,
  Signer,
  typedData,
} from "starknet";
import { toBN } from "starknet/utils/number";
import { CONTROLLER_CLASS } from "./constants";

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
    return [toBN(CONTROLLER_CLASS).toString(), "1", pub, ...(sig as string[])];
  }

  public async signMessage(
    typedData: typedData.TypedData,
    accountAddress: string,
  ): Promise<Signature> {
    const sig = await super.signMessage(typedData, accountAddress);
    const pub = await this.getPubKey();
    return [toBN(CONTROLLER_CLASS).toString(), "1", pub, ...(sig as string[])];
  }
}
