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
  ControllerFactory,
  JsAddSignerInput,
  JsCall,
  JsChainConfig,
  JsFeeSource,
  JsFelt,
  JsRegister,
  JsRegisterResponse,
  JsRemoveSignerInput,
  JsRevokableSession,
  JsSignedOutsideExecution,
  MultiChainAccount,
  Owner,
  Signer,
} from "@cartridge/controller-wasm/controller";

import { credentialToAuth } from "@/components/connect/types";
import { ParsedSessionPolicies, toWasmPolicies } from "@/hooks/session";
import { CredentialMetadata } from "@cartridge/ui/utils/api/cartridge";
import { DeployedAccountTransaction } from "@starknet-io/types-js";
import { toJsFeeEstimate } from "./fee";

export default class Controller {
  private multiChainAccount: MultiChainAccount;
  private _chainId: string;
  private _appId: string;
  private _username: string;
  private _address: string;
  private _classHash: string;
  private _rpcUrl: string;
  private _owner: Owner;
  provider: Provider;

  constructor() {
    throw new Error("Initialize with Controller.login or Controller.create");
  }

  private async getAccount(): Promise<CartridgeAccount> {
    return await this.multiChainAccount.controller(this._chainId);
  }

  appId() {
    return this._appId;
  }

  address() {
    return this._address;
  }

  username() {
    return this._username;
  }

  classHash() {
    return this._classHash;
  }

  owner() {
    return this._owner;
  }

  ownerGuid() {
    // Note: ownerGuid was previously from cartridgeMeta but isn't essential
    // for most operations. Returning empty string for backward compatibility
    return "";
  }

  rpcUrl() {
    return this._rpcUrl;
  }

  chainId() {
    return this._chainId;
  }

  async disconnect() {
    const account = await this.getAccount();
    await account.disconnect();
    delete window.controller;
  }

  async register(registerInput: JsRegister): Promise<JsRegisterResponse> {
    const account = await this.getAccount();
    return await account.register(registerInput);
  }

  async createSession(
    expiresAt: bigint,
    policies: ParsedSessionPolicies,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _maxFee?: BigNumberish,
  ) {
    const account = await this.getAccount();
    return await account.createSession(
      toWasmPolicies(policies),
      expiresAt,
    );
  }

  async skipSession(policies: ParsedSessionPolicies) {
    const account = await this.getAccount();
    await account.skipSession(toWasmPolicies(policies));
  }

  async createPasskeySigner(rpId: string) {
    const account = await this.getAccount();
    return await account.createPasskeySigner(rpId);
  }

  async addOwner(
    owner: Signer | null,
    signerInput: JsAddSignerInput | null,
    rp_id: string | null,
  ) {
    const account = await this.getAccount();
    await account.addOwner(owner, signerInput, rp_id);
  }

  async removeSigner(signerInput: JsRemoveSignerInput) {
    const account = await this.getAccount();
    await account.removeOwner(signerInput);
  }

  async registerSessionCalldata(
    expiresAt: bigint,
    policies: ParsedSessionPolicies,
    publicKey: string,
  ): Promise<Array<string>> {
    const account = await this.getAccount();
    return await account.registerSessionCalldata(
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
    const account = await this.getAccount();
    return await account.registerSession(
      toWasmPolicies(policies),
      expiresAt,
      publicKey,
      toJsFeeEstimate(maxFee),
    );
  }

  async upgrade(new_class_hash: JsFelt): Promise<JsCall> {
    const account = await this.getAccount();
    return await account.upgrade(new_class_hash);
  }

  async executeFromOutsideV2(
    calls: Call[],
    feeSource?: JsFeeSource,
  ): Promise<InvokeFunctionResponse> {
    const account = await this.getAccount();
    return await account.executeFromOutsideV2(
      toJsCalls(calls),
      feeSource,
    );
  }

  async executeFromOutsideV3(
    calls: Call[],
    feeSource?: JsFeeSource,
  ): Promise<InvokeFunctionResponse> {
    const account = await this.getAccount();
    return await account.executeFromOutsideV3(
      toJsCalls(calls),
      feeSource,
    );
  }

  async execute(
    calls: Call[],
    maxFee?: FeeEstimate,
    feeSource?: JsFeeSource,
  ): Promise<InvokeFunctionResponse> {
    const account = await this.getAccount();
    return await account.execute(
      toJsCalls(calls),
      toJsFeeEstimate(maxFee),
      feeSource,
    );
  }

  async trySessionExecute(
    calls: Call[],
    feeSource?: JsFeeSource,
  ): Promise<InvokeFunctionResponse> {
    const account = await this.getAccount();
    return await account.trySessionExecute(toJsCalls(calls), feeSource);
  }

  async hasAuthorizedPoliciesForCalls(calls: Call[]): Promise<boolean> {
    const account = await this.getAccount();
    return await account.hasAuthorizedPoliciesForCalls(toJsCalls(calls));
  }

  async hasAuthorizedPoliciesForMessage(
    typedData: TypedData,
  ): Promise<boolean> {
    const account = await this.getAccount();
    return await account.hasAuthorizedPoliciesForMessage(
      JSON.stringify(typedData),
    );
  }

  async isRegisteredSessionAuthorized(
    policies: ParsedSessionPolicies,
    public_key?: string,
  ): Promise<AuthorizedSession | undefined> {
    const account = await this.getAccount();
    return await account.isRegisteredSessionAuthorized(
      toWasmPolicies(policies),
      public_key,
    );
  }

  async isRequestedSession(policies: ParsedSessionPolicies): Promise<boolean> {
    const account = await this.getAccount();
    return await account.hasRequestedSession(toWasmPolicies(policies));
  }

  async estimateInvokeFee(calls: Call[]): Promise<FeeEstimate> {
    const account = await this.getAccount();
    const res = (await account.estimateInvokeFee(
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
    const account = await this.getAccount();
    return account.signMessage(JSON.stringify(typedData));
  }

  async signExecuteFromOutside(
    calls: Call[],
  ): Promise<JsSignedOutsideExecution> {
    const account = await this.getAccount();
    return await account.signExecuteFromOutside(toJsCalls(calls));
  }

  async selfDeploy(maxFee?: FeeEstimate): Promise<DeployedAccountTransaction> {
    const account = await this.getAccount();
    return await account.deploySelf(toJsFeeEstimate(maxFee));
  }

  async delegateAccount(): Promise<string> {
    const account = await this.getAccount();
    return account.delegateAccount();
  }

  async revokeSession(session: JsRevokableSession) {
    const account = await this.getAccount();
    return await account.revokeSession(session);
  }

  async revokeSessions(sessions: JsRevokableSession[]) {
    const account = await this.getAccount();
    return await account.revokeSessions(sessions);
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
    // Create chain configuration
    const chainConfig = new JsChainConfig(classHash, rpcUrl, owner, address);

    // Create MultiChainAccount with single chain
    const multiChainAccount = await MultiChainAccount.create(
      appId,
      username,
      [chainConfig],
      import.meta.env.VITE_CARTRIDGE_API_URL,
    );

    // Get chainId from provider
    const provider = new RpcProvider({ nodeUrl: rpcUrl });
    const chainId = await provider.getChainId();

    const controller = Object.create(Controller.prototype) as Controller;
    controller.provider = provider;
    controller.multiChainAccount = multiChainAccount;
    controller._chainId = chainId;
    controller._appId = appId;
    controller._username = username.toLowerCase();
    controller._address = address;
    controller._classHash = classHash;
    controller._rpcUrl = rpcUrl;
    controller._owner = owner;

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
    // Create chain configuration
    const chainConfig = new JsChainConfig(classHash, rpcUrl, owner, address);

    // Create MultiChainAccount with single chain
    const multiChainAccount = await MultiChainAccount.create(
      appId,
      username,
      [chainConfig],
      import.meta.env.VITE_CARTRIDGE_API_URL,
    );

    // Get chainId from provider
    const provider = new RpcProvider({ nodeUrl: rpcUrl });
    const chainId = await provider.getChainId();

    const controller = Object.create(Controller.prototype) as Controller;
    controller.provider = provider;
    controller.multiChainAccount = multiChainAccount;
    controller._chainId = chainId;
    controller._appId = appId;
    controller._username = username.toLowerCase();
    controller._address = address;
    controller._classHash = classHash;
    controller._rpcUrl = rpcUrl;
    controller._owner = owner;

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

    const [, session] = loginResult.intoValues();

    // Create chain configuration for MultiChainAccount
    const chainConfig = new JsChainConfig(classHash, rpcUrl, owner, address);

    // Create MultiChainAccount with single chain
    const multiChainAccount = await MultiChainAccount.create(
      appId,
      username,
      [chainConfig],
      cartridgeApiUrl,
    );

    // Get chainId from provider
    const provider = new RpcProvider({ nodeUrl: rpcUrl });
    const chainId = await provider.getChainId();

    const controller = Object.create(Controller.prototype) as Controller;
    controller.provider = provider;
    controller.multiChainAccount = multiChainAccount;
    controller._chainId = chainId;
    controller._appId = appId;
    controller._username = username.toLowerCase();
    controller._address = address;
    controller._classHash = classHash;
    controller._rpcUrl = rpcUrl;
    controller._owner = owner;

    return {
      controller,
      session,
    };
  }

  static async fromStore(appId: string): Promise<Controller | undefined> {
    // Try loading with ControllerFactory first to get metadata
    const cartridgeWithMeta = await ControllerFactory.fromStorage(
      appId,
      import.meta.env.VITE_CARTRIDGE_API_URL,
    );
    if (!cartridgeWithMeta) {
      return undefined;
    }

    const meta = cartridgeWithMeta.meta();

    // Create chain configuration for MultiChainAccount
    const chainConfig = new JsChainConfig(
      meta.classHash(),
      meta.rpcUrl(),
      meta.owner(),
      meta.address(),
    );

    // Create MultiChainAccount with the loaded configuration
    const multiChainAccount = await MultiChainAccount.create(
      meta.appId(),
      meta.username(),
      [chainConfig],
      import.meta.env.VITE_CARTRIDGE_API_URL,
    );

    const controller = Object.create(Controller.prototype) as Controller;
    controller.provider = new RpcProvider({ nodeUrl: meta.rpcUrl() });
    controller.multiChainAccount = multiChainAccount;
    controller._chainId = meta.chainId();
    controller._appId = meta.appId();
    controller._username = meta.username();
    controller._address = meta.address();
    controller._classHash = meta.classHash();
    controller._rpcUrl = meta.rpcUrl();
    controller._owner = meta.owner();

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
