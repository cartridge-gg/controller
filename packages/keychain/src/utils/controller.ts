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
  ControllerBuilderFactory,
  JsAddSignerInput,
  JsCall,
  JsFeeSource,
  JsFelt,
  JsRegister,
  JsRegisterResponse,
  JsRemoveSignerInput,
  JsRevokableSession,
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

  async removeSigner(signerGuid: JsRemoveSignerInput) {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }
    await this.cartridge.removeOwner(signerGuid);
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
    return res;
  }

  async signMessage(typedData: TypedData): Promise<Signature> {
    return this.cartridge.signMessage(JSON.stringify(typedData));
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

  static create({
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
    chainId,
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
    chainId: string;
    address: string;
    username: string;
    owner: Owner;
    cartridgeApiUrl: string;
    session_expires_at_s: number;
    isControllerRegistered: boolean;
  }) {
    const loginResult = await ControllerBuilderFactory.login(
      appId,
      username,
      classHash,
      rpcUrl,
      chainId,
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

  static fromStore(appId: string) {
    const cartridgeWithMeta = CartridgeAccount.fromStorage(
      appId,
      import.meta.env.VITE_CARTRIDGE_API_URL,
    );
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

export const allUseSameAuth = (signers: CredentialMetadata[]) => {
  return signers.every(
    (signer) => credentialToAuth(signer) === credentialToAuth(signers[0]),
  );
};
