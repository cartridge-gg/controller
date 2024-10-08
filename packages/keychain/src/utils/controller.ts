import {
  Account,
  BigNumberish,
  addAddressPadding,
  num,
  InvokeFunctionResponse,
  Signature,
  AllowArray,
  Call,
  UniversalDetails,
  Abi,
  EstimateFeeDetails,
  EstimateFee,
  ec,
  TypedData,
} from "starknet";

import { PaymasterOptions, Policy } from "@cartridge/controller";

import {
  CartridgeAccount,
  JsCall,
  JsFelt,
  JsInvocationsDetails,
  SessionMetadata,
} from "@cartridge/account-wasm";
import { normalizeCalls } from "./connection/execute";

export default class Controller extends Account {
  cartridge: CartridgeAccount;

  constructor({
    appId,
    chainId,
    rpcUrl,
    address,
    username,
    publicKey,
    credentialId,
  }: {
    appId: string;
    chainId: string;
    rpcUrl: string;
    address: string;
    username: string;
    publicKey: string;
    credentialId: string;
  }) {
    super({ nodeUrl: rpcUrl }, address, "");

    this.cartridge = CartridgeAccount.new(
      appId,
      rpcUrl,
      chainId,
      address,
      username,
      {
        webauthn: {
          rpId: process.env.NEXT_PUBLIC_RP_ID,
          credentialId,
          publicKey,
        },
      },
    );
  }

  username() {
    return this.cartridge.username();
  }

  rpcUrl() {
    return this.cartridge.rpcUrl();
  }

  chainId() {
    return this.cartridge.chainId();
  }

  disconnect() {
    this.cartridge.disconnect();
    delete window.controller;
  }

  async createSession(
    expiresAt: bigint,
    policies: Policy[],
    _maxFee?: BigNumberish,
  ) {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }

    await this.cartridge.createSession(policies, expiresAt);
  }

  registerSessionCalldata(
    expiresAt: bigint,
    policies: Policy[],
    publicKey: string,
  ): Array<string> {
    return this.cartridge.registerSessionCalldata(
      policies,
      expiresAt,
      publicKey,
    );
  }

  async registerSession(
    expiresAt: bigint,
    policies: Policy[],
    publicKey: string,
    maxFee: BigNumberish,
  ): Promise<InvokeFunctionResponse> {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }

    return await this.cartridge.registerSession(
      policies,
      expiresAt,
      publicKey,
      num.toHex(maxFee),
    );
  }

  upgrade(new_class_hash: JsFelt): JsCall {
    return this.cartridge.upgrade(new_class_hash);
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

  session(
    policies: Policy[],
    public_key?: string,
  ): SessionMetadata | undefined {
    return this.cartridge.session(policies, public_key);
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

  revoke(_origin: string) {
    // TODO: Cartridge Account SDK to implement revoke session tokens
    console.error("revoke unimplemented");
  }

  static fromStore(appId: string) {
    let cartridge = CartridgeAccount.fromStorage(appId);
    if (!cartridge) {
      return;
    }

    const controller = new Account(
      { nodeUrl: cartridge.rpcUrl() },
      cartridge.address(),
      "",
    ) as Controller;

    Object.setPrototypeOf(controller, Controller.prototype);
    controller.cartridge = cartridge;
    return controller;
  }
}

export function diff(a: Policy[], b: Policy[]): Policy[] {
  return a.reduce(
    (prev, policy) =>
      b.some(
        (approval) =>
          addAddressPadding(approval.target) ===
            addAddressPadding(policy.target) &&
          approval.method === policy.method,
      )
        ? prev
        : [...prev, policy],
    [] as Policy[],
  );
}
