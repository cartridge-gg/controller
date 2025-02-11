import {
  BigNumberish,
  num,
  InvokeFunctionResponse,
  Signature,
  EstimateFee,
  TypedData,
  Call,
  CallData,
  Provider,
  RpcProvider,
} from "starknet";

import {
  CartridgeAccount,
  CartridgeAccountMeta,
  JsCall,
  JsFelt,
  Owner,
  SessionMetadata,
} from "@cartridge/account-wasm/controller";

import { DeployedAccountTransaction } from "@starknet-io/types-js";
import { ParsedSessionPolicies, toWasmPolicies } from "@/hooks/session";
import { toJsFeeEstimate, fromJsFeeEstimate } from "./fee";

export default class Controller {
  private cartridge: CartridgeAccount;
  private cartridgeMeta: CartridgeAccountMeta;
  provider: Provider;

  constructor({
    appId,
    classHash,
    chainId,
    rpcUrl,
    address,
    username,
    owner,
  }: {
    appId: string;
    classHash: string;
    chainId: string;
    rpcUrl: string;
    address: string;
    username: string;
    owner: Owner;
  }) {
    const accountWithMeta = CartridgeAccount.new(
      appId,
      classHash,
      rpcUrl,
      chainId,
      address,
      username,
      owner,
    );

    this.provider = new RpcProvider({ nodeUrl: rpcUrl });
    this.cartridgeMeta = accountWithMeta.meta();
    this.cartridge = accountWithMeta.intoAccount();
  }

  appId() {
    return this.cartridgeMeta.appId();
  }

  address() {
    return this.cartridgeMeta.address();
  }

  username() {
    return this.cartridgeMeta.username();
  }

  classHash() {
    return this.cartridgeMeta.classHash();
  }

  owner() {
    return this.cartridgeMeta.owner();
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

  async disconnect() {
    await this.cartridge.disconnect();
    delete window.controller;
  }

  async createSession(
    expiresAt: bigint,
    policies: ParsedSessionPolicies,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _maxFee?: BigNumberish,
  ) {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }

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
    expiresAt: bigint,
    policies: ParsedSessionPolicies,
    publicKey: string,
    maxFee?: EstimateFee,
  ): Promise<InvokeFunctionResponse> {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }

    // If the overall_fee is 0n then it is a free txn
    const jsMaxFee =
      maxFee && maxFee.overall_fee != 0n ? toJsFeeEstimate(maxFee) : undefined;
    return await this.cartridge.registerSession(
      toWasmPolicies(policies),
      expiresAt,
      publicKey,
      jsMaxFee,
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
    maxFee?: EstimateFee,
  ): Promise<InvokeFunctionResponse> {
    return await this.cartridge.execute(
      toJsCalls(calls),
      maxFee ? toJsFeeEstimate(maxFee) : undefined,
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

  async estimateInvokeFee(calls: Call[]): Promise<EstimateFee> {
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

    const estimate = fromJsFeeEstimate(res);
    return { ...estimate, suggestedMaxFee };
  }

  async signMessage(typedData: TypedData): Promise<Signature> {
    return this.cartridge.signMessage(JSON.stringify(typedData));
  }

  async selfDeploy(maxFee?: EstimateFee): Promise<DeployedAccountTransaction> {
    return await this.cartridge.deploySelf(
      maxFee ? toJsFeeEstimate(maxFee) : undefined,
    );
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
    const controller = Object.create(Controller.prototype) as Controller;
    controller.provider = new RpcProvider({ nodeUrl: meta.rpcUrl() });
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
