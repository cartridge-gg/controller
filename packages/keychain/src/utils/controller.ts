import {
  BigNumberish,
  Call,
  CallData,
  FeeEstimate,
  InvokeFunctionResponse,
  Provider,
  RpcProvider,
  Signature,
  TypedData,
} from "starknet";

import {
  AuthorizedSession,
  CartridgeAccount,
  CartridgeAccountMeta,
  ControllerFactory,
  JsAddSignerInput,
  JsCall,
  JsFeeSource,
  JsFelt,
  JsRegister,
  JsRegisterResponse,
  JsRemoveSignerInput,
  JsRevokableSession,
  JsSignedOutsideExecution,
  Owner,
  Signer,
} from "@cartridge/controller-wasm/controller";

import { credentialToAuth } from "@/components/connect/types";
import { ParsedSessionPolicies, toWasmPolicies } from "@/hooks/session";
import { CredentialMetadata } from "@cartridge/ui/utils/api/cartridge";
import { DeployedAccountTransaction } from "@starknet-io/types-js";
import { toJsFeeEstimate } from "./fee";

export default class Controller {
  private cartridge: CartridgeAccount;
  private cartridgeMeta: CartridgeAccountMeta;
  provider: Provider;

  constructor() {
    throw new Error("Initialize with Controller.login or Controller.create");
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

  async register(registerInput: JsRegister): Promise<JsRegisterResponse> {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }
    return await this.cartridge.register(registerInput);
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

    return await this.cartridge.createSession(
      toWasmPolicies(policies),
      expiresAt,
    );
  }

  async skipSession(policies: ParsedSessionPolicies) {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }

    await this.cartridge.skipSession(toWasmPolicies(policies));
  }

  async createPasskeySigner(rpId: string) {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }
    return await this.cartridge.createPasskeySigner(rpId);
  }

  async addOwner(
    owner: Signer | null,
    signerInput: JsAddSignerInput | null,
    rp_id: string | null,
  ) {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }
    await this.cartridge.addOwner(owner, signerInput, rp_id);
  }

  async removeSigner(signerInput: JsRemoveSignerInput) {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }
    await this.cartridge.removeOwner(signerInput);
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
    maxFee?: FeeEstimate,
  ): Promise<InvokeFunctionResponse> {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }

    return await this.cartridge.registerSession(
      toWasmPolicies(policies),
      expiresAt,
      publicKey,
      toJsFeeEstimate(maxFee),
    );
  }

  async upgrade(new_class_hash: JsFelt): Promise<JsCall> {
    return await this.cartridge.upgrade(new_class_hash);
  }

  async executeFromOutsideV2(
    calls: Call[],
    feeSource?: JsFeeSource,
  ): Promise<InvokeFunctionResponse> {
    return await this.cartridge.executeFromOutsideV2(
      toJsCalls(calls),
      feeSource,
    );
  }

  async executeFromOutsideV3(
    calls: Call[],
    feeSource?: JsFeeSource,
  ): Promise<InvokeFunctionResponse> {
    return await this.cartridge.executeFromOutsideV3(
      toJsCalls(calls),
      feeSource,
    );
  }

  async execute(
    calls: Call[],
    maxFee?: FeeEstimate,
    feeSource?: JsFeeSource,
  ): Promise<InvokeFunctionResponse> {
    return await this.cartridge.execute(
      toJsCalls(calls),
      toJsFeeEstimate(maxFee),
      feeSource,
    );
  }

  async hasAuthorizedPoliciesForCalls(calls: Call[]): Promise<boolean> {
    return await this.cartridge.hasAuthorizedPoliciesForCalls(toJsCalls(calls));
  }

  async hasAuthorizedPoliciesForMessage(
    typedData: TypedData,
  ): Promise<boolean> {
    return await this.cartridge.hasAuthorizedPoliciesForMessage(
      JSON.stringify(typedData),
    );
  }

  async isRegisteredSessionAuthorized(
    policies: ParsedSessionPolicies,
    public_key?: string,
  ): Promise<AuthorizedSession | undefined> {
    return await this.cartridge.isRegisteredSessionAuthorized(
      toWasmPolicies(policies),
      public_key,
    );
  }

  async isRequestedSession(policies: ParsedSessionPolicies): Promise<boolean> {
    return await this.cartridge.hasRequestedSession(toWasmPolicies(policies));
  }

  async estimateInvokeFee(calls: Call[]): Promise<FeeEstimate> {
    const res = (await this.cartridge.estimateInvokeFee(
      toJsCalls(calls),
    )) as FeeEstimate;
    res.unit = "FRI";

    // Scale all fee estimate values by 50% (equivalent to 1.5x)
    // Using starknet.js addPercent pattern for consistency
    const addPercent = (number: string | number, percent: number): string => {
      const bigIntNum = BigInt(number);
      return (bigIntNum + (bigIntNum * BigInt(percent)) / 100n).toString();
    };

    res.l1_gas_consumed = addPercent(res.l1_gas_consumed, 50);
    res.l1_gas_price = addPercent(res.l1_gas_price, 50);
    res.l2_gas_consumed = addPercent(res.l2_gas_consumed, 50);
    res.l2_gas_price = addPercent(res.l2_gas_price, 50);
    res.l1_data_gas_consumed = addPercent(res.l1_data_gas_consumed, 50);
    res.l1_data_gas_price = addPercent(res.l1_data_gas_price, 50);
    res.overall_fee = addPercent(addPercent(res.overall_fee, 50), 50); // 2.25x total

    return res;
  }

  async signMessage(typedData: TypedData): Promise<Signature> {
    return this.cartridge.signMessage(JSON.stringify(typedData));
  }

  async signExecuteFromOutside(
    calls: Call[],
  ): Promise<JsSignedOutsideExecution> {
    return await this.cartridge.signExecuteFromOutside(toJsCalls(calls));
  }

  async selfDeploy(maxFee?: FeeEstimate): Promise<DeployedAccountTransaction> {
    return await this.cartridge.deploySelf(toJsFeeEstimate(maxFee));
  }

  async delegateAccount(): Promise<string> {
    return this.cartridge.delegateAccount();
  }

  async revokeSession(session: JsRevokableSession) {
    return await this.cartridge.revokeSession(session);
  }

  async revokeSessions(sessions: JsRevokableSession[]) {
    return await this.cartridge.revokeSessions(sessions);
  }

  static async apiLogin({
    appId,
    classHash,
    rpcUrl,
    address,
    username,
    owner,
  }: {
    appId: string;
    classHash: string;
    rpcUrl: string;
    address: string;
    username: string;
    owner: Owner;
  }): Promise<Controller> {
    const accountWithMeta = await ControllerFactory.apiLogin(
      appId,
      username,
      classHash,
      rpcUrl,
      address,
      owner,
      import.meta.env.VITE_CARTRIDGE_API_URL,
    );

    const controller = Object.create(Controller.prototype) as Controller;
    controller.provider = new RpcProvider({ nodeUrl: rpcUrl });
    controller.cartridgeMeta = accountWithMeta.meta();
    controller.cartridge = accountWithMeta.intoAccount();

    return controller;
  }

  static async create({
    appId,
    classHash,
    rpcUrl,
    address,
    username,
    owner,
  }: {
    appId: string;
    classHash: string;
    rpcUrl: string;
    address: string;
    username: string;
    owner: Owner;
  }): Promise<Controller> {
    const accountWithMeta = await CartridgeAccount.new(
      appId,
      classHash,
      rpcUrl,
      address,
      username,
      owner,
      import.meta.env.VITE_CARTRIDGE_API_URL,
    );

    const controller = Object.create(Controller.prototype) as Controller;
    controller.provider = new RpcProvider({ nodeUrl: rpcUrl });
    controller.cartridgeMeta = accountWithMeta.meta();
    controller.cartridge = accountWithMeta.intoAccount();

    return controller;
  }

  static async login({
    appId,
    classHash,
    rpcUrl,
    address,
    username,
    owner,
    cartridgeApiUrl,
    session_expires_at_s,
    isControllerRegistered,
  }: {
    appId: string;
    classHash: string;
    rpcUrl: string;
    address: string;
    username: string;
    owner: Owner;
    cartridgeApiUrl: string;
    session_expires_at_s: number;
    isControllerRegistered: boolean;
  }): Promise<{
    controller: Controller;
    session: JsRevokableSession;
  }> {
    const loginResult = await ControllerFactory.login(
      appId,
      username,
      classHash,
      rpcUrl,
      address,
      owner,
      cartridgeApiUrl,
      BigInt(session_expires_at_s),
      isControllerRegistered,
    );

    const [accountWithMeta, session] = loginResult.intoValues();

    const controller = Object.create(Controller.prototype) as Controller;
    controller.provider = new RpcProvider({ nodeUrl: rpcUrl });
    controller.cartridgeMeta = accountWithMeta.meta();
    controller.cartridge = accountWithMeta.intoAccount();

    return {
      controller,
      session,
    };
  }

  static async fromStore(appId: string): Promise<Controller | undefined> {
    const cartridgeWithMeta = await ControllerFactory.fromStorage(
      appId,
      import.meta.env.VITE_CARTRIDGE_API_URL,
    );
    if (!cartridgeWithMeta) {
      return undefined;
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

export const allUseSameAuth = (signers: CredentialMetadata[]) => {
  return signers.every(
    (signer) => credentialToAuth(signer) === credentialToAuth(signers[0]),
  );
};
