import { ec, encode, stark, WalletAccount } from "starknet";
import { loadConfig, SessionPolicies } from "@cartridge/presets";
import { AddStarknetChainParameters } from "@starknet-io/types-js";
import { signerToGuid } from "../session";

import SessionAccount from "./account";
import { KEYCHAIN_URL } from "../constants";
import BaseProvider from "../provider";
import { getPresetSessionPolicies, toWasmPolicies } from "../utils";
import { parsePolicies, ParsedSessionPolicies } from "../policies";
import { AuthOptions } from "../types";
import { NodeBackend } from "./backend";

export type SessionOptions = {
  rpc: string;
  chainId: string;
  policies?: SessionPolicies;
  preset?: string;
  shouldOverridePresetPolicies?: boolean;
  basePath: string;
  keychainUrl?: string;
  signupOptions?: AuthOptions;
};

export default class SessionProvider extends BaseProvider {
  public id = "controller_session";
  public name = "Controller Session";

  protected _chainId: string;
  protected _rpcUrl: string;
  protected _username?: string;
  protected _policies: ParsedSessionPolicies;
  protected _preset?: string;
  protected _keychainUrl: string;
  protected _signupOptions?: AuthOptions;
  protected _backend: NodeBackend;
  private _readyPromise: Promise<void>;

  constructor({
    rpc,
    chainId,
    policies,
    preset,
    shouldOverridePresetPolicies,
    basePath,
    keychainUrl,
    signupOptions,
  }: SessionOptions) {
    super();

    if (!policies && !preset) {
      throw new Error("Either `policies` or `preset` must be provided");
    }

    // Policy precedence logic (matching SessionProvider):
    // 1. If shouldOverridePresetPolicies is true and policies are provided, use policies
    // 2. Otherwise, if preset is defined, resolve policies from preset
    // 3. Otherwise, use provided policies
    if ((!preset || shouldOverridePresetPolicies) && policies) {
      this._policies = parsePolicies(policies);
    } else {
      this._preset = preset;
      if (policies) {
        console.warn(
          "[Controller] Both `preset` and `policies` provided to SessionProvider. " +
            "Policies are ignored when preset is set. " +
            "Use `shouldOverridePresetPolicies: true` to override.",
        );
      }
      this._policies = { verified: false };
    }

    this._rpcUrl = rpc;
    this._chainId = chainId;
    this._keychainUrl = keychainUrl || KEYCHAIN_URL;
    this._signupOptions = signupOptions;
    this._backend = new NodeBackend(basePath);

    this._readyPromise = this._resolvePreset();
  }

  private async _resolvePreset(): Promise<void> {
    if (!this._preset) return;

    const config = await loadConfig(this._preset);
    if (!config) {
      throw new Error(`Failed to load preset: ${this._preset}`);
    }

    const sessionPolicies = getPresetSessionPolicies(config, this._chainId);
    if (!sessionPolicies) {
      throw new Error(
        `No policies found for chain ${this._chainId} in preset ${this._preset}`,
      );
    }

    this._policies = parsePolicies(sessionPolicies);
  }

  private validatePoliciesSubset(
    newPolicies: ParsedSessionPolicies,
    existingPolicies: ParsedSessionPolicies,
  ): boolean {
    if (newPolicies.contracts) {
      if (!existingPolicies.contracts) return false;

      for (const [address, contract] of Object.entries(newPolicies.contracts)) {
        const existingContract = existingPolicies.contracts[address];
        if (!existingContract) return false;

        for (const method of contract.methods) {
          const existingMethod = existingContract.methods.find(
            (m) => m.entrypoint === method.entrypoint,
          );
          if (!existingMethod || !existingMethod.authorized) return false;
        }
      }
    }

    if (newPolicies.messages) {
      if (!existingPolicies.messages) return false;

      for (const message of newPolicies.messages) {
        const existingMessage = existingPolicies.messages.find(
          (m) =>
            JSON.stringify(m.domain) === JSON.stringify(message.domain) &&
            JSON.stringify(m.types) === JSON.stringify(message.types),
        );
        if (!existingMessage || !existingMessage.authorized) return false;
      }
    }

    return true;
  }

  async username() {
    await this._readyPromise;

    const sessionStr = await this._backend.get("session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      return session.username;
    }
    return undefined;
  }

  async probe(): Promise<WalletAccount | undefined> {
    await this._readyPromise;

    if (this.account) {
      return this.account;
    }

    const [sessionStr, signerStr] = await Promise.all([
      this._backend.get("session"),
      this._backend.get("signer"),
    ]);

    if (!sessionStr || !signerStr) {
      return undefined;
    }

    const session = JSON.parse(sessionStr);
    const signer = JSON.parse(signerStr);

    // Check expiration
    const expirationTime = parseInt(session.expiresAt) * 1000;
    if (Date.now() >= expirationTime) {
      await this.disconnect();
      return undefined;
    }

    // Check stored policies are a superset of current policies
    const storedPoliciesStr = await this._backend.get("policies");
    if (storedPoliciesStr) {
      const storedPolicies = JSON.parse(
        storedPoliciesStr,
      ) as ParsedSessionPolicies;

      if (!this.validatePoliciesSubset(this._policies, storedPolicies)) {
        await this.disconnect();
        return undefined;
      }
    }

    this._username = session.username;
    this.account = new SessionAccount(this, {
      rpcUrl: this._rpcUrl,
      privateKey: signer.privKey,
      address: session.address,
      ownerGuid: session.ownerGuid,
      chainId: this._chainId,
      expiresAt: parseInt(session.expiresAt),
      policies: toWasmPolicies(this._policies),
      guardianKeyGuid: session.guardianKeyGuid,
      metadataHash: session.metadataHash,
      sessionKeyGuid: session.sessionKeyGuid,
    });

    return this.account;
  }

  async connect(): Promise<WalletAccount | undefined> {
    await this._readyPromise;

    if (this.account) {
      return this.account;
    }

    const account = await this.probe();
    if (account) {
      return account;
    }

    const pk = stark.randomAddress();
    const publicKey = ec.starkCurve.getStarkKey(pk);

    await this._backend.set(
      "signer",
      JSON.stringify({
        privKey: pk,
        pubKey: publicKey,
      }),
    );

    // Get redirect URI from local server
    const redirectUri = await this._backend.getRedirectUri();

    let url =
      `${this._keychainUrl}/session` +
      `?public_key=${encodeURIComponent(publicKey)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&redirect_query_name=startapp` +
      `&rpc_url=${encodeURIComponent(this._rpcUrl)}`;

    if (this._preset) {
      url += `&preset=${encodeURIComponent(this._preset)}`;
    } else {
      url += `&policies=${encodeURIComponent(JSON.stringify(this._policies))}`;
    }

    if (this._signupOptions) {
      url += `&signers=${encodeURIComponent(JSON.stringify(this._signupOptions))}`;
    }

    this._backend.openLink(url);

    // Wait for callback with session data
    const sessionData = await this._backend.waitForCallback();
    if (sessionData) {
      const sessionRegistration = JSON.parse(atob(sessionData));
      const formattedPk = encode.addHexPrefix(publicKey);
      // Ensure addresses are properly formatted
      sessionRegistration.address = sessionRegistration.address.toLowerCase();
      sessionRegistration.ownerGuid =
        sessionRegistration.ownerGuid.toLowerCase();
      sessionRegistration.guardianKeyGuid = "0x0";
      sessionRegistration.metadataHash = "0x0";
      sessionRegistration.sessionKeyGuid = signerToGuid({
        starknet: { privateKey: formattedPk },
      });
      await this._backend.set("session", JSON.stringify(sessionRegistration));
      await this._backend.set("policies", JSON.stringify(this._policies));
      return this.probe();
    }

    return undefined;
  }

  async disconnect(): Promise<void> {
    await this._backend.delete("signer");
    await this._backend.delete("session");
    await this._backend.delete("policies");
    this.account = undefined;
    this._username = undefined;
  }

  switchStarknetChain(_chainId: string): Promise<boolean> {
    throw new Error("switchStarknetChain not implemented");
  }

  addStarknetChain(_chain: AddStarknetChainParameters): Promise<boolean> {
    throw new Error("addStarknetChain not implemented");
  }
}
