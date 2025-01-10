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

import {
  CartridgeAccount,
  CartridgeAccountMeta,
  JsCall,
  JsFelt,
  JsInvocationsDetails,
  SessionMetadata,
} from "@cartridge/account-wasm/controller";

import { DeployedAccountTransaction } from "@starknet-io/types-js";
import { ParsedSessionPolicies, toWasmPolicies } from "@/hooks/session";

export default class Controller extends Account {
  private cartridge: CartridgeAccount;
  private cartridgeMeta: CartridgeAccountMeta;

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

    const accountWithMeta = CartridgeAccount.new(
      appId,
      classHash,
      rpcUrl,
      chainId,
      address,
      username,
      {
        webauthn: {
          rpId: import.meta.env.VITE_RP_ID!,
          credentialId,
          publicKey,
        },
      },
    );

    this.cartridgeMeta = accountWithMeta.meta();
    this.cartridge = accountWithMeta.intoAccount();
  }

  username() {
    return this.cartridgeMeta.username();
  }

  classHash() {
    return this.cartridgeMeta.classHash();
  }

  ownerGuid() {
    return this.cartridgeMeta.ownerGuid();
  }

  rpcUrl() {
    return this.cartridgeMeta.rpcUrl();
  }

  chainId() {
    return this.cartridgeMeta.chainId();
  }

  async switchChain(rpcUrl: string): Promise<void> {
    await this.cartridge.switchChain(rpcUrl);
  }

  async disconnect() {
    await this.cartridge.disconnect();
    delete window.controller;
  }

  async createSession(
    duration: bigint,
    policies: ParsedSessionPolicies,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _maxFee?: BigNumberish,
  ) {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }

    const expiresAt = duration + BigInt(Math.floor(Date.now() / 1000));
    await this.cartridge.createSession(toWasmPolicies(policies), expiresAt);
  }

  async registerSessionCalldata(
    expiresAt: bigint,
    policies: ParsedSessionPolicies,
    publicKey: string,
  ): Promise<Array<string>> {
    return await this.cartridge.registerSessionCalldata(
      toWasmPolicies(policies),
      expiresAt,
      publicKey,
    );
  }

  async registerSession(
    duration: bigint,
    policies: ParsedSessionPolicies,
    publicKey: string,
    maxFee: BigNumberish,
  ): Promise<InvokeFunctionResponse> {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }

    const expiresAt = duration + BigInt(Math.floor(Date.now() / 1000));

    return await this.cartridge.registerSession(
      toWasmPolicies(policies),
      expiresAt,
      publicKey,
      num.toHex(maxFee),
    );
  }

  async upgrade(new_class_hash: JsFelt): Promise<JsCall> {
    return await this.cartridge.upgrade(new_class_hash);
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

  async hasSession(calls: Call[]): Promise<boolean> {
    return await this.cartridge.hasSession(toJsCalls(calls));
  }

  async hasSessionForMessage(typedData: TypedData): Promise<boolean> {
    return await this.cartridge.hasSessionForMessage(JSON.stringify(typedData));
  }

  async getAuthorizedSessionMetadata(
    policies: ParsedSessionPolicies,
    public_key?: string,
  ): Promise<SessionMetadata | undefined> {
    return await this.cartridge.getAuthorizedSessionMetadata(
      toWasmPolicies(policies),
      public_key,
    );
  }

  async isRequestedSession(
    policies: ParsedSessionPolicies,
    public_key?: string,
  ): Promise<boolean> {
    return await this.cartridge.isRequestedSession(
      toWasmPolicies(policies),
      public_key,
    );
  }

  async estimateInvokeFee(
    calls: Call[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // @ts-expect-error TODO: fix overload type mismatch
    if (BigInt(signature[0]) === 0n) {
      return ec.starkCurve.verify(
        // @ts-expect-error TODO: fix overload type mismatch
        signature,
        BigInt(hash).toString(),
        // @ts-expect-error TODO: fix overload type mismatch
        signature[0],
      );
    }

    return super.verifyMessageHash(hash, signature);
  }

  async signMessage(typedData: TypedData): Promise<Signature> {
    return this.cartridge.signMessage(JSON.stringify(typedData));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any
  async getNonce(_?: any): Promise<string> {
    return await this.cartridge.getNonce();
  }

  async selfDeploy(maxFee: BigNumberish): Promise<DeployedAccountTransaction> {
    return await this.cartridge.deploySelf(num.toHex(maxFee));
  }

  async delegateAccount(): Promise<string> {
    return this.cartridge.delegateAccount();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  revoke(_origin: string) {
    // TODO: Cartridge Account SDK to implement revoke session tokens
    console.error("revoke unimplemented");
  }

  static fromStore(appId: string) {
    const cartridgeWithMeta = CartridgeAccount.fromStorage(appId);
    if (!cartridgeWithMeta) {
      return;
    }

    const meta = cartridgeWithMeta.meta();

    const controller = new Account(
      { nodeUrl: meta.rpcUrl() },
      meta.address(),
      "",
    ) as Controller;

    Object.setPrototypeOf(controller, Controller.prototype);
    controller.cartridge = cartridgeWithMeta.intoAccount();
    controller.cartridgeMeta = meta;
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
