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
  ErrorCode,
  ImportedControllerMetadata,
  ImportedSessionMetadata,
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
import { ParsedSessionPolicies } from "@/hooks/session";
import { clearBearerToken } from "@/utils/bearer-token";
import { createRateLimitedFetch } from "@/utils/rate-limit";
import { toWasmPolicies } from "@cartridge/controller";
import { CredentialMetadata } from "@cartridge/controller-ui/utils/api/cartridge";
import { DeployedAccountTransaction } from "@starknet-io/types-js";
import { toJsFeeEstimate } from "./fee";

export interface ImportedControllerState {
  controller: ImportedControllerMetadata;
  session?: ImportedSessionMetadata;
}

export type MultichainSessionInput = {
  chainId: string;
  rpcUrl: string;
  policies: ParsedSessionPolicies;
};

export type MultichainSessionResult = {
  chainId: string;
  session?: AuthorizedSession;
  error?: Error;
};

export type MultichainRegisterResult = {
  chainId: string;
  transactionHash?: string;
  error?: Error;
};

export default class Controller {
  private cartridge: CartridgeAccount;
  private cartridgeMeta: CartridgeAccountMeta;
  provider: Provider;

  constructor() {
    throw new Error("Initialize with Controller.login or Controller.create");
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
    clearBearerToken();
    delete window.controller;
  }

  async register(registerInput: JsRegister): Promise<JsRegisterResponse> {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }
    return await this.cartridge.register(registerInput);
  }

  async exportMetadata(): Promise<ImportedControllerMetadata> {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }

    return await this.cartridge.exportMetadata();
  }

  async exportAuthorizedSession(
    appId?: string,
  ): Promise<ImportedSessionMetadata | undefined> {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }

    return await this.cartridge.exportAuthorizedSession(appId);
  }

  async importSession(importedSession: ImportedSessionMetadata) {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }

    await this.cartridge.importSession(importedSession);
  }

  async exportState(appId?: string): Promise<ImportedControllerState> {
    return {
      controller: await this.exportMetadata(),
      session: await this.exportAuthorizedSession(appId),
    };
  }

  async createSession(
    appId: string,
    expiresAt: bigint,
    policies: ParsedSessionPolicies,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _maxFee?: BigNumberish,
  ) {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }

    return await this.cartridge.createSession(
      appId,
      toWasmPolicies(policies),
      expiresAt,
    );
  }

  /**
   * Creates one session per chain within a single approval flow.
   *
   * The session hash is chain-bound (its SNIP-12 domain embeds the chain id),
   * so each chain requires its own owner signature — sequential by design
   * since WebAuthn owners get one prompt per signature. Sessions are created
   * on ephemeral per-chain accounts sharing this controller's identity (the
   * same pattern as `switchChain`); the WASM persists each one under
   * chain-scoped storage keys, so a later chain switch finds its session
   * without re-approval.
   *
   * A failed chain does not abort the loop: already-created sessions stay
   * valid and the caller can retry the remaining chains.
   */
  async createMultichainSession(
    appId: string,
    expiresAt: bigint,
    chainSessions: MultichainSessionInput[],
    onProgress?: (chainId: string, index: number, total: number) => void,
  ): Promise<MultichainSessionResult[]> {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }

    // Active chain first so the primary session lands even if the user
    // cancels a later signature.
    const activeChainId = BigInt(this.chainId());
    const ordered = [...chainSessions].sort((a, b) => {
      const aActive = BigInt(a.chainId) === activeChainId ? 0 : 1;
      const bActive = BigInt(b.chainId) === activeChainId ? 0 : 1;
      return aActive - bActive;
    });

    const results: MultichainSessionResult[] = [];
    let usedEphemeralAccount = false;

    for (const [index, chain] of ordered.entries()) {
      const isActiveChain = BigInt(chain.chainId) === activeChainId;
      onProgress?.(chain.chainId, index, ordered.length);
      try {
        if (isActiveChain) {
          const session = await this.createSession(
            appId,
            expiresAt,
            chain.policies,
          );
          results.push({ chainId: chain.chainId, session });
        } else {
          usedEphemeralAccount = true;
          const session = await this.withEphemeralAccount(
            chain.rpcUrl,
            (account) =>
              account.createSession(
                appId,
                toWasmPolicies(chain.policies),
                expiresAt,
              ),
          );
          results.push({ chainId: chain.chainId, session });
        }
      } catch (e) {
        results.push({
          chainId: chain.chainId,
          error: e instanceof Error ? e : new Error(String(e)),
        });
      }
    }

    // Constructing a per-chain account may repoint the WASM's persisted
    // "active" selector at the last chain touched, which would resurrect the
    // controller on the wrong chain after a reload. Re-materialize the active
    // chain's account to leave storage pointing where it started.
    if (usedEphemeralAccount) {
      try {
        await this.withEphemeralAccount(this.rpcUrl(), async () => {});
      } catch (e) {
        console.error("Failed to restore active chain account state:", e);
      }
    }

    return results;
  }

  /**
   * Registers a session on-chain (`register_session`) on each given chain,
   * sequentially, via ephemeral per-chain accounts. Used by the standalone
   * `/session` flow where the dapp supplies the session public key; the
   * active chain is expected to be registered through the regular execution
   * flow and NOT included here.
   *
   * An already-registered session on a chain counts as success, which makes
   * retries idempotent.
   */
  async registerSessionOnChains(
    appId: string,
    expiresAt: bigint,
    chains: MultichainSessionInput[],
    publicKey: string,
    onProgress?: (chainId: string, index: number, total: number) => void,
  ): Promise<MultichainRegisterResult[]> {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }

    const results: MultichainRegisterResult[] = [];

    for (const [index, chain] of chains.entries()) {
      onProgress?.(chain.chainId, index, chains.length);
      try {
        const { transaction_hash } = await this.withEphemeralAccount(
          chain.rpcUrl,
          (account) =>
            account.registerSession(
              appId,
              toWasmPolicies(chain.policies),
              expiresAt,
              publicKey,
              undefined,
            ),
        );
        results.push({
          chainId: chain.chainId,
          transactionHash: transaction_hash,
        });
      } catch (e) {
        if (
          (e as { code?: number })?.code === ErrorCode.SessionAlreadyRegistered
        ) {
          results.push({ chainId: chain.chainId });
          continue;
        }
        results.push({
          chainId: chain.chainId,
          error: e instanceof Error ? e : new Error(String(e)),
        });
      }
    }

    if (chains.length > 0) {
      try {
        await this.withEphemeralAccount(this.rpcUrl(), async () => {});
      } catch (e) {
        console.error("Failed to restore active chain account state:", e);
      }
    }

    return results;
  }

  // Builds a short-lived WASM account for another chain sharing this
  // controller's identity (same owner/classHash/address), runs `fn`, and
  // frees the WASM handles.
  private async withEphemeralAccount<T>(
    rpcUrl: string,
    fn: (account: CartridgeAccount) => Promise<T>,
  ): Promise<T> {
    const accountWithMeta = await CartridgeAccount.new(
      this.classHash(),
      rpcUrl,
      this.address(),
      this.username(),
      this.owner(),
      import.meta.env.VITE_CARTRIDGE_API_URL,
    );
    const account = accountWithMeta.intoAccount();
    try {
      return await fn(account);
    } finally {
      account.free();
    }
  }

  async skipSession(appId: string, policies: ParsedSessionPolicies) {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }

    await this.cartridge.skipSession(appId, toWasmPolicies(policies));
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
    appId: string,
    expiresAt: bigint,
    policies: ParsedSessionPolicies,
    publicKey: string,
    maxFee?: FeeEstimate,
  ): Promise<InvokeFunctionResponse> {
    if (!this.cartridge) {
      throw new Error("Account not found");
    }

    return await this.cartridge.registerSession(
      appId,
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

  async trySessionExecute(
    appId: string,
    calls: Call[],
    feeSource?: JsFeeSource,
  ): Promise<InvokeFunctionResponse> {
    return await this.cartridge.trySessionExecute(
      appId,
      toJsCalls(calls),
      feeSource,
    );
  }

  async hasAuthorizedPoliciesForCalls(
    appId: string,
    calls: Call[],
  ): Promise<boolean> {
    return await this.cartridge.hasAuthorizedPoliciesForCalls(
      appId,
      toJsCalls(calls),
    );
  }

  async hasAuthorizedPoliciesForMessage(
    appId: string,
    typedData: TypedData,
  ): Promise<boolean> {
    return await this.cartridge.hasAuthorizedPoliciesForMessage(
      appId,
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

  async isRequestedSession(
    appId: string,
    policies: ParsedSessionPolicies,
  ): Promise<boolean> {
    return await this.cartridge.hasRequestedSession(
      appId,
      toWasmPolicies(policies),
    );
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

  private static fromCartridgeAccountWithMeta(
    accountWithMeta: Awaited<ReturnType<typeof CartridgeAccount.new>>,
    rpcUrl?: string,
  ): Controller {
    const meta = accountWithMeta.meta();
    const controller = Object.create(Controller.prototype) as Controller;
    controller.provider = new RpcProvider({
      nodeUrl: rpcUrl ?? meta.rpcUrl(),
      baseFetch: createRateLimitedFetch(),
    });
    controller.cartridgeMeta = meta;
    controller.cartridge = accountWithMeta.intoAccount();

    return controller;
  }

  static async apiLogin({
    classHash,
    rpcUrl,
    address,
    username,
    owner,
  }: {
    classHash: string;
    rpcUrl: string;
    address: string;
    username: string;
    owner: Owner;
  }): Promise<Controller> {
    const accountWithMeta = await ControllerFactory.apiLogin(
      username,
      classHash,
      rpcUrl,
      address,
      owner,
      import.meta.env.VITE_CARTRIDGE_API_URL,
    );

    return Controller.fromCartridgeAccountWithMeta(accountWithMeta, rpcUrl);
  }

  static async create({
    classHash,
    rpcUrl,
    address,
    username,
    owner,
  }: {
    classHash: string;
    rpcUrl: string;
    address: string;
    username: string;
    owner: Owner;
  }): Promise<Controller> {
    const accountWithMeta = await CartridgeAccount.new(
      classHash,
      rpcUrl,
      address,
      username,
      owner,
      import.meta.env.VITE_CARTRIDGE_API_URL,
    );

    return Controller.fromCartridgeAccountWithMeta(accountWithMeta, rpcUrl);
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
      username,
      classHash,
      rpcUrl,
      address,
      owner,
      cartridgeApiUrl,
      BigInt(session_expires_at_s),
      isControllerRegistered,
      true,
      appId,
    );

    const [accountWithMeta, session] = loginResult.intoValues();

    const controller = Controller.fromCartridgeAccountWithMeta(
      accountWithMeta,
      rpcUrl,
    );

    return {
      controller,
      session,
    };
  }

  static async fromMetadata(
    metadata: ImportedControllerMetadata,
  ): Promise<Controller> {
    const accountWithMeta = await ControllerFactory.fromMetadata(
      metadata,
      import.meta.env.VITE_CARTRIDGE_API_URL,
    );

    return Controller.fromCartridgeAccountWithMeta(
      accountWithMeta,
      metadata.rpcUrl,
    );
  }

  static async importState(
    importedState: ImportedControllerState,
  ): Promise<Controller> {
    const controller = await Controller.fromMetadata(importedState.controller);

    if (importedState.session) {
      await controller.importSession(importedState.session);
    }

    return controller;
  }

  static async fromStore(): Promise<Controller | undefined> {
    const cartridgeWithMeta = await ControllerFactory.fromStorage(
      import.meta.env.VITE_CARTRIDGE_API_URL,
    );
    if (!cartridgeWithMeta) {
      return undefined;
    }

    return Controller.fromCartridgeAccountWithMeta(cartridgeWithMeta);
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
