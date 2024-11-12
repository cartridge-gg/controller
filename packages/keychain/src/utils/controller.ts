import {
  Account,
  BigNumberish,
  num,
  InvokeFunctionResponse,
  Signature,
  EstimateFeeDetails,
  EstimateFee,
  ec,
  TypedData,
  UniversalDetails,
  Abi,
  Call,
  CallData,
} from "starknet";

import { Policy } from "@cartridge/controller";

import {
  CartridgeAccount,
  JsCall,
  JsFelt,
  JsInvocationsDetails,
  SessionMetadata,
} from "@cartridge/account-wasm/controller";

export default class Controller extends Account {
  cartridge: CartridgeAccount;

  constructor({
    appId,
    classHash,
    chainId,
    rpcUrl,
    address,
    username,
    publicKey,
    credentialId,
  }: {
    appId: string;
    classHash: string;
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
      classHash,
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

  async executeFromOutsideV2(calls: Call[]): Promise<InvokeFunctionResponse> {
    return await this.cartridge.executeFromOutsideV2(toJsCalls(calls));
  }

  async executeFromOutsideV3(calls: Call[]): Promise<InvokeFunctionResponse> {
    return await this.cartridge.executeFromOutsideV3(toJsCalls(calls));
  }

  async execute(
    calls: Call[],
    abisOrDetails?: Abi[] | UniversalDetails,
    details?: UniversalDetails,
  ): Promise<InvokeFunctionResponse> {
    const executionDetails =
      (Array.isArray(abisOrDetails) ? details : abisOrDetails) || {};

    if (executionDetails.maxFee !== undefined) {
      executionDetails.maxFee = num.toHex(executionDetails.maxFee);
    }

    return await this.cartridge.execute(
      toJsCalls(calls),
      executionDetails as JsInvocationsDetails,
    );
  }

  hasSession(calls: Call[]): boolean {
    return this.cartridge.hasSession(toJsCalls(calls));
  }

  hasSessionForMessage(typedData: TypedData): boolean {
    return this.cartridge.hasSessionForMessage(JSON.stringify(typedData));
  }

  session(
    policies: Policy[],
    public_key?: string,
  ): SessionMetadata | undefined {
    return this.cartridge.session(policies, public_key);
  }

  async estimateInvokeFee(
    calls: Call[],
    _: EstimateFeeDetails = {},
  ): Promise<EstimateFee> {
    const res = await this.cartridge.estimateInvokeFee(toJsCalls(calls));

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

// wasm expects calldata as hex
function toJsCalls(calls: Call[]): JsCall[] {
  return calls.map((call) => ({
    ...call,
    calldata: CallData.toHex(call.calldata),
  }));
}
