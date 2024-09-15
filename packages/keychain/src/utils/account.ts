import {
  Account as BaseAccount,
  RpcProvider,
  SignerInterface,
  Call,
  EstimateFeeDetails,
  EstimateFee,
  Signature,
  ec,
  InvokeFunctionResponse,
  TypedData,
  BigNumberish,
  AllowArray,
  UniversalDetails,
  Abi,
  num,
} from "starknet";

import {
  CartridgeAccount,
  JsInvocationsDetails,
  SessionMetadata,
} from "@cartridge/account-wasm";
import { normalizeCalls } from "./connection/execute";
import { PaymasterOptions, Policy } from "@cartridge/controller";

class Account extends BaseAccount {
  rpc: RpcProvider;
  chainId: string;
  username: string;
  cartridge: CartridgeAccount;

  constructor(
    appId: string,
    chainId: string,
    nodeUrl: string,
    address: string,
    username: string,
    signer: SignerInterface,
    webauthn: {
      rpId: string;
      credentialId: string;
      publicKey: string;
    },
  ) {
    super({ nodeUrl }, address, signer);

    this.rpc = new RpcProvider({ nodeUrl });
    this.chainId = chainId;
    this.username = username;
    this.cartridge = CartridgeAccount.new(
      appId,
      nodeUrl,
      chainId,
      address,
      webauthn.rpId,
      username,
      webauthn.credentialId,
      webauthn.publicKey,
    );
  }

  async executeFromOutside(
    calls: AllowArray<Call>,
    _?: PaymasterOptions,
  ): Promise<InvokeFunctionResponse> {
    return await this.cartridge.executeFromOutside(normalizeCalls(calls));
  }

  async execute(
    transactions: AllowArray<Call>,
    abisOrDetails?: Abi[] | UniversalDetails,
    details?: UniversalDetails,
  ): Promise<InvokeFunctionResponse> {
    const executionDetails =
      (Array.isArray(abisOrDetails) ? details : abisOrDetails) || {};
    if (executionDetails.maxFee !== undefined) {
      executionDetails.maxFee = num.toHex(executionDetails.maxFee);
    }

    const res = await this.cartridge.execute(
      normalizeCalls(transactions),
      executionDetails as JsInvocationsDetails,
    );

    return res;
  }

  hasSession(calls: AllowArray<Call>): boolean {
    return this.cartridge.hasSession(normalizeCalls(calls));
  }

  session(policies: Policy[]): SessionMetadata | undefined {
    return this.cartridge.session(policies);
  }

  async estimateInvokeFee(
    calls: AllowArray<Call>,
    _: EstimateFeeDetails = {},
  ): Promise<EstimateFee> {
    const res = await this.cartridge.estimateInvokeFee(normalizeCalls(calls));

    // The reason why we set the multiplier unseemingly high is to account
    // for the fact that the estimation above is done without validation (ie SKIP_VALIDATE).
    //
    // Setting it lower might cause the actual transaction to fail due to
    // insufficient max fee.
    const MULTIPLIER_PERCENTAGE = 170; // x1.7

    // This will essentially multiply the estimated fee by 1.7
    const suggestedMaxFee = num.addPercent(
      BigInt(res.overall_fee),
      MULTIPLIER_PERCENTAGE,
    );

    return { suggestedMaxFee, ...res };
  }

  async verifyMessageHash(
    hash: BigNumberish,
    signature: Signature,
  ): Promise<boolean> {
    if (BigInt(signature[0]) === 0n) {
      return ec.starkCurve.verify(
        // @ts-expect-error TODO: fix overload type mismatch
        signature,
        BigInt(hash).toString(),
        signature[0],
      );
    }

    return super.verifyMessageHash(hash, signature);
  }

  async signMessage(typedData: TypedData): Promise<Signature> {
    return this.cartridge.signMessage(JSON.stringify(typedData));
  }

  async getNonce(_?: any): Promise<string> {
    return await this.cartridge.getNonce();
  }

  async delegateAccount(): Promise<string> {
    return this.cartridge.delegateAccount();
  }
}

export default Account;
