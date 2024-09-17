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
} from "starknet";

import {
  CartridgeAccount,
  JsInvocationsDetails,
} from "@cartridge/account-wasm";
import { normalizeCalls } from "./connection/execute";
import { PaymasterOptions } from "@cartridge/controller";

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

    const res = await this.cartridge.execute(
      normalizeCalls(transactions),
      executionDetails as JsInvocationsDetails,
    );

    return res;
  }

  hasSession(calls: AllowArray<Call>): boolean {
    return this.cartridge.hasSession(normalizeCalls(calls));
  }

  sessionJson(): string {
    return this.cartridge.sessionJson();
  }

  async estimateInvokeFee(
    calls: AllowArray<Call>,
    _: EstimateFeeDetails = {},
  ): Promise<EstimateFee> {
    // For doing bigint multiplication with floating point numbers.
    function bigint_mul_float(bigIntValue: bigint, floatValue: number) {
      // Scale factor (e.g., 1e6 for 6 decimal places of precision)
      const scaleFactor = 1000000;
      const scaledFloat = BigInt(Math.round(floatValue * scaleFactor));
      const result = bigIntValue * scaledFloat;
      return BigInt(result) / BigInt(scaleFactor);
    }

    // The reason why we set the multiplier unseemingly high is to account
    // for the fact that the estimate is done without validation.
    //
    // Setting it lower might cause the actual transaction to fail due to
    // insufficient max fee.
    const res = await this.cartridge.estimateInvokeFee(normalizeCalls(calls));

    const ESTIMATE_FEE_MULITPLIER = 1.7;
    const suggestedMaxFee = bigint_mul_float(
      BigInt(res.overall_fee),
      ESTIMATE_FEE_MULITPLIER,
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
