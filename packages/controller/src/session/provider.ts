import { ec, stark, WalletAccount } from "starknet";

import { signerToGuid } from "./internal/utils";
import { subscribeCreateSession } from "./internal/subscribe";
import { loadConfig, SessionPolicies } from "@cartridge/presets";
import { AddStarknetChainParameters } from "@starknet-io/types-js";
import { encode } from "starknet";
import { API_URL, KEYCHAIN_URL, REDIRECT_QUERY_NAME } from "../constants";
import { parsePolicies, ParsedSessionPolicies } from "../policies";
import BaseProvider from "../provider";
import { AuthOptions } from "../types";
import { getPresetSessionPolicies, toWasmPolicies } from "../utils";
import SessionAccount from "./account";

interface SessionRegistration {
  username: string;
  address: string;
  ownerGuid: string;
  transactionHash?: string;
  expiresAt: string;
  guardianKeyGuid: string;
  metadataHash: string;
  sessionKeyGuid: string;
  allowedPoliciesRoot?: string;
}

export type SessionChainOption = {
  rpc: string;
  chainId: string;
};

export type SessionOptions = {
  rpc: string;
  chainId: string;
  /**
   * Explicit opt-in to multichain sessions: every chain (beyond `rpc`/
   * `chainId`, which stays the active one) that a single registration flow
   * must cover. Each chain needs resolvable policies (preset or manual).
   */
  chains?: SessionChainOption[];
  policies?: SessionPolicies;
  preset?: string;
  shouldOverridePresetPolicies?: boolean;
  redirectUrl: string;
  disconnectRedirectUrl?: string;
  keychainUrl?: string;
  apiUrl?: string;
  signupOptions?: AuthOptions;
};

export default class SessionProvider extends BaseProvider {
  public id = "controller_session";
  public name = "Controller Session";

  protected _chainId: string;
  protected _rpcUrl: string;
  protected _username?: string;
  protected _redirectUrl: string;
  protected _disconnectRedirectUrl?: string;
  protected _policies: ParsedSessionPolicies;
  // Multichain opt-in: every covered chain (active one included), with its
  // resolved policies. Empty when single-chain.
  protected _sessionChains: SessionChainOption[] = [];
  protected _chainPolicies: Map<string, ParsedSessionPolicies> = new Map();
  protected _accounts: Map<string, SessionAccount> = new Map();
  protected _preset?: string;
  protected _keychainUrl: string;
  protected _apiUrl: string;
  protected _publicKey!: string;
  protected _sessionKeyGuid!: string;
  protected _signupOptions?: AuthOptions;
  private _readyPromise: Promise<void>;
  public reopenBrowser: boolean = true;

  constructor({
    rpc,
    chainId,
    chains,
    policies,
    preset,
    shouldOverridePresetPolicies,
    redirectUrl,
    disconnectRedirectUrl,
    keychainUrl,
    apiUrl,
    signupOptions,
  }: SessionOptions) {
    super();

    if (!policies && !preset) {
      throw new Error("Either `policies` or `preset` must be provided");
    }

    // Policy precedence logic (matching ControllerProvider):
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

    // Multichain opt-in: normalize to the full covered set, active chain
    // first, deduplicated by chain id.
    if (chains && chains.length > 0) {
      const seen = new Set<bigint>([BigInt(chainId)]);
      this._sessionChains = [{ rpc, chainId }];
      for (const chain of chains) {
        const id = BigInt(chain.chainId);
        if (seen.has(id)) continue;
        seen.add(id);
        this._sessionChains.push(chain);
      }
    }

    this._rpcUrl = rpc;
    this._chainId = chainId;
    this._redirectUrl = redirectUrl;
    this._disconnectRedirectUrl = disconnectRedirectUrl;
    this._keychainUrl = keychainUrl || KEYCHAIN_URL;
    this._apiUrl = apiUrl ?? API_URL;
    this._signupOptions = signupOptions;

    this._setSigningKeys();
    this._readyPromise = this._resolvePreset();

    if (typeof window !== "undefined") {
      (window as any).starknet_controller_session = this;
    }
  }

  private _setSigningKeys(): void {
    const signerString = localStorage.getItem("sessionSigner");
    if (signerString) {
      const signer = JSON.parse(signerString);
      this._publicKey = signer.pubKey;
      this._sessionKeyGuid = signerToGuid({
        starknet: { privateKey: encode.addHexPrefix(signer.privKey) },
      });
    } else {
      const pk = stark.randomAddress();
      this._publicKey = ec.starkCurve.getStarkKey(pk);

      localStorage.setItem(
        "sessionSigner",
        JSON.stringify({
          privKey: pk,
          pubKey: this._publicKey,
        }),
      );
      this._sessionKeyGuid = signerToGuid({
        starknet: { privateKey: encode.addHexPrefix(pk) },
      });
    }
  }

  // Resolve preset policies asynchronously.
  // Public methods await this before proceeding.
  private async _resolvePreset(): Promise<void> {
    if (!this._preset) {
      // Manual policies apply to every opted-in chain.
      for (const chain of this._sessionChains) {
        this._chainPolicies.set(chain.chainId, this._policies);
      }
      return;
    }

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

    // Multichain opt-in: every covered chain must resolve, a missing chain is
    // an error (the registration flow would silently cover fewer chains than
    // the dapp asked for).
    for (const chain of this._sessionChains) {
      const chainPolicies = getPresetSessionPolicies(config, chain.chainId);
      if (!chainPolicies) {
        throw new Error(
          `No policies found for chain ${chain.chainId} in preset ${this._preset}`,
        );
      }
      this._chainPolicies.set(chain.chainId, parsePolicies(chainPolicies));
    }
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

  private padBase64(value: string): string {
    const padding = value.length % 4;
    if (padding === 0) {
      return value;
    }
    return value + "=".repeat(4 - padding);
  }

  private normalizeSession(
    session: Partial<SessionRegistration>,
  ): SessionRegistration | undefined {
    if (
      session.username === undefined ||
      session.address === undefined ||
      session.ownerGuid === undefined ||
      session.expiresAt === undefined
    ) {
      return undefined;
    }

    return {
      username: session.username,
      address: session.address,
      ownerGuid: session.ownerGuid,
      transactionHash: session.transactionHash,
      expiresAt: session.expiresAt,
      guardianKeyGuid: session.guardianKeyGuid ?? "0x0",
      metadataHash: session.metadataHash ?? "0x0",
      sessionKeyGuid: session.sessionKeyGuid ?? this._sessionKeyGuid,
    };
  }

  public ingestSessionFromRedirect(
    encodedSession: string,
  ): SessionRegistration | undefined {
    try {
      const decoded = atob(this.padBase64(encodedSession));
      const parsed = JSON.parse(decoded) as Partial<SessionRegistration>;
      const normalized = this.normalizeSession(parsed);
      if (!normalized) {
        return undefined;
      }
      localStorage.setItem("session", JSON.stringify(normalized));
      return normalized;
    } catch (e) {
      console.error("Failed to ingest session redirect", e);
      return undefined;
    }
  }

  async username() {
    await this._readyPromise;

    if (!this.account) {
      this.tryRetrieveSessionAccount();
    }

    return this._username;
  }

  async probe(): Promise<WalletAccount | undefined> {
    await this._readyPromise;

    if (!this.account) {
      this.tryRetrieveSessionAccount();
    }

    return this.account;
  }

  async connect(): Promise<WalletAccount | undefined> {
    await this._readyPromise;

    if (!this.account) {
      this.tryRetrieveSessionAccount();
    }

    if (this.account) {
      return this.account;
    }

    localStorage.setItem(
      "sessionPolicies",
      JSON.stringify(this._storablePolicies()),
    );
    localStorage.setItem("lastUsedConnector", this.id);

    try {
      if (this.reopenBrowser) {
        const pk = stark.randomAddress();
        this._publicKey = ec.starkCurve.getStarkKey(pk);

        localStorage.setItem(
          "sessionSigner",
          JSON.stringify({
            privKey: pk,
            pubKey: this._publicKey,
          }),
        );
        this._sessionKeyGuid = signerToGuid({
          starknet: { privateKey: encode.addHexPrefix(pk) },
        });
        let url =
          `${this._keychainUrl}` +
          `/session?public_key=${this._publicKey}` +
          `&redirect_uri=${this._redirectUrl}` +
          `&redirect_query_name=startapp` +
          `&rpc_url=${this._rpcUrl}`;

        // Multichain opt-in: the keychain registers the session on every
        // covered chain within the same flow.
        if (this._sessionChains.length > 0) {
          const sessionChains = this._sessionChains.map((chain) => ({
            chainId: chain.chainId,
            rpcUrl: chain.rpc,
          }));
          url += `&session_chains=${encodeURIComponent(JSON.stringify(sessionChains))}`;
        }

        if (this._preset) {
          url += `&preset=${encodeURIComponent(this._preset)}`;
        } else {
          url += `&policies=${encodeURIComponent(JSON.stringify(this._policies))}`;
        }

        if (this._signupOptions) {
          url += `&signers=${encodeURIComponent(JSON.stringify(this._signupOptions))}`;
        }

        window.open(url, "_blank");
      }

      const sessionResult = await subscribeCreateSession(
        this._sessionKeyGuid,
        this._apiUrl,
      );

      // auth is: [shortstring!('authorization-by-registered'), owner_guid]
      const ownerGuid = sessionResult.authorization[1];
      const session: SessionRegistration = {
        username: sessionResult.controller.accountID,
        address: sessionResult.controller.address,
        ownerGuid,
        expiresAt: sessionResult.expiresAt,
        guardianKeyGuid: "0x0",
        metadataHash: "0x0",
        sessionKeyGuid: this._sessionKeyGuid,
      };
      localStorage.setItem("session", JSON.stringify(session));

      this.tryRetrieveSessionAccount();

      return this.account;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  // Stored shape of the approved policies: a per-chain map when multichain,
  // the plain active-chain policies otherwise (legacy shape).
  private _storablePolicies():
    | ParsedSessionPolicies
    | { multichain: true; chains: Record<string, ParsedSessionPolicies> } {
    if (this._sessionChains.length === 0) {
      return this._policies;
    }
    const chains: Record<string, ParsedSessionPolicies> = {};
    for (const [chainId, policies] of this._chainPolicies) {
      chains[chainId] = policies;
    }
    return { multichain: true, chains };
  }

  /**
   * Switches the active chain of a multichain session.
   *
   * The stored registration is chain-agnostic (registered sessions are
   * validated on-chain), so switching only rebinds the account to the target
   * chain's rpc and policies — no new approval. Returns false when the chain
   * was not part of the multichain opt-in or no session is available.
   */
  async switchStarknetChain(chainId: string): Promise<boolean> {
    await this._readyPromise;

    if (BigInt(chainId) === BigInt(this._chainId)) {
      return true;
    }

    const chain = this._sessionChains.find(
      (c) => BigInt(c.chainId) === BigInt(chainId),
    );
    const policies = this._chainPolicies.get(chain?.chainId ?? "");
    if (!chain || !policies) {
      console.error(
        `switchStarknetChain: chain ${chainId} is not part of the session's chains`,
      );
      return false;
    }

    // Make sure a session exists before rebinding.
    if (!this.account) {
      this.tryRetrieveSessionAccount();
      if (!this.account) {
        return false;
      }
    }

    const cached = this._accounts.get(chain.chainId);
    if (cached) {
      this.account = cached;
    } else {
      const account = this._buildSessionAccount(chain, policies);
      if (!account) {
        return false;
      }
      this._accounts.set(chain.chainId, account);
      this.account = account;
    }

    this._chainId = chain.chainId;
    this._rpcUrl = chain.rpc;
    this.emitNetworkChanged(chain.chainId);

    return true;
  }

  private _buildSessionAccount(
    chain: SessionChainOption,
    policies: ParsedSessionPolicies,
  ): SessionAccount | undefined {
    const sessionString = localStorage.getItem("session");
    const signerString = localStorage.getItem("sessionSigner");
    if (!sessionString || !signerString) {
      return undefined;
    }

    const sessionRegistration = this.normalizeSession(
      JSON.parse(sessionString) as Partial<SessionRegistration>,
    );
    if (!sessionRegistration) {
      return undefined;
    }
    const signer = JSON.parse(signerString);

    return new SessionAccount(this, {
      rpcUrl: chain.rpc,
      privateKey: signer.privKey,
      address: sessionRegistration.address,
      ownerGuid: sessionRegistration.ownerGuid,
      chainId: chain.chainId,
      expiresAt: parseInt(sessionRegistration.expiresAt),
      policies: toWasmPolicies(policies),
      guardianKeyGuid: sessionRegistration.guardianKeyGuid,
      metadataHash: sessionRegistration.metadataHash,
      sessionKeyGuid: sessionRegistration.sessionKeyGuid,
    });
  }

  addStarknetChain(_chain: AddStarknetChainParameters): Promise<boolean> {
    throw new Error("addStarknetChain not implemented");
  }

  disconnect(): Promise<void> {
    localStorage.removeItem("sessionSigner");
    localStorage.removeItem("session");
    localStorage.removeItem("sessionPolicies");
    localStorage.removeItem("lastUsedConnector");
    this.account = undefined;
    this._username = undefined;
    this._accounts.clear();

    // calling this InjectedConnector callback hangs forever, and we do not disconnect properly
    // looking at InjectedConnector, it will disconnect is we pass [], so it must be safe to bypass
    // this seems to be removed in the starknet 9 version
    // this.emitAccountsChanged([]);

    const disconnectUrl = new URL(`${this._keychainUrl}`);
    disconnectUrl.pathname = "disconnect";

    this._disconnectRedirectUrl &&
      disconnectUrl.searchParams.append(
        "redirect_url",
        this._disconnectRedirectUrl,
      );

    this._preset && disconnectUrl.searchParams.append("preset", this._preset);

    const openedWindow = window.open(disconnectUrl, "_blank");
    if (openedWindow === null) return Promise.resolve();

    const { resolve, promise } = Promise.withResolvers<void>();
    function onWindowClose() {
      if (openedWindow?.closed) {
        resolve();
        clearInterval(checkInterval);
      }
    }
    const checkInterval = setInterval(onWindowClose, 500);
    return promise;
  }

  // Try to retrieve the session account from localStorage or URL query params
  private tryRetrieveSessionAccount() {
    if (this.account) {
      return this.account;
    }

    let sessionRegistration: SessionRegistration | null = null;

    // Load session from localStorage (saved by ingestSessionFromRedirect or connect)
    const sessionString = localStorage.getItem("session");
    if (sessionString) {
      const parsed = JSON.parse(sessionString) as Partial<SessionRegistration>;
      const normalized = this.normalizeSession(parsed);
      if (normalized) {
        sessionRegistration = normalized;
        localStorage.setItem("session", JSON.stringify(sessionRegistration));
      } else {
        this.clearStoredSession();
      }
    }

    if (window.location.search.includes(REDIRECT_QUERY_NAME)) {
      const params = new URLSearchParams(window.location.search);
      const session = params.get(REDIRECT_QUERY_NAME);
      if (session) {
        const normalizedSession = this.ingestSessionFromRedirect(session);
        if (
          normalizedSession &&
          Number(normalizedSession.expiresAt) !==
            Number(sessionRegistration?.expiresAt)
        ) {
          sessionRegistration = normalizedSession;
        }

        // Remove the session query parameter
        params.delete(REDIRECT_QUERY_NAME);
        const newUrl =
          window.location.pathname +
          (params.toString() ? `?${params.toString()}` : "") +
          window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      }
    }

    const signerString = localStorage.getItem("sessionSigner");
    const signer = signerString ? JSON.parse(signerString) : null;

    if (!sessionRegistration || !signer) {
      return;
    }

    // Check expiration
    const expirationTime = parseInt(sessionRegistration.expiresAt) * 1000;
    if (Date.now() >= expirationTime) {
      this.clearStoredSession();
      return;
    }

    // Check stored policies. The stored value is either the legacy
    // single-chain shape or a per-chain map for multichain sessions.
    const storedPoliciesStr = localStorage.getItem("sessionPolicies");
    if (storedPoliciesStr) {
      const stored = JSON.parse(storedPoliciesStr) as
        | ParsedSessionPolicies
        | { multichain: true; chains: Record<string, ParsedSessionPolicies> };

      if ("multichain" in stored && stored.multichain) {
        if (this._sessionChains.length === 0) {
          // Multichain grant, single-chain request: the active chain's stored
          // policies must cover the request.
          const active = this._findStoredChainPolicies(
            stored.chains,
            this._chainId,
          );
          if (!active || !this.validatePoliciesSubset(this._policies, active)) {
            this.clearStoredSession();
            return;
          }
        } else {
          // Every requested chain must be covered by the stored grant.
          for (const chain of this._sessionChains) {
            const requested = this._chainPolicies.get(chain.chainId);
            const storedChain = this._findStoredChainPolicies(
              stored.chains,
              chain.chainId,
            );
            if (
              !requested ||
              !storedChain ||
              !this.validatePoliciesSubset(requested, storedChain)
            ) {
              this.clearStoredSession();
              return;
            }
          }
        }
      } else {
        if (this._sessionChains.length > 0) {
          // Single-chain grant cannot satisfy a multichain request.
          this.clearStoredSession();
          return;
        }
        const isValid = this.validatePoliciesSubset(
          this._policies,
          stored as ParsedSessionPolicies,
        );
        if (!isValid) {
          this.clearStoredSession();
          return;
        }
      }
    }

    this._username = sessionRegistration.username;
    this.account = new SessionAccount(this, {
      rpcUrl: this._rpcUrl,
      privateKey: signer.privKey,
      address: sessionRegistration.address,
      ownerGuid: sessionRegistration.ownerGuid,
      chainId: this._chainId,
      expiresAt: parseInt(sessionRegistration.expiresAt),
      policies: toWasmPolicies(this._policies),
      guardianKeyGuid: sessionRegistration.guardianKeyGuid,
      metadataHash: sessionRegistration.metadataHash,
      sessionKeyGuid: sessionRegistration.sessionKeyGuid,
    });
    if (this._sessionChains.length > 0) {
      this._accounts.set(this._chainId, this.account as SessionAccount);
    }

    return this.account;
  }

  // Stored chain keys may differ in casing/padding from the requested ones;
  // compare as field elements.
  private _findStoredChainPolicies(
    chains: Record<string, ParsedSessionPolicies>,
    chainId: string,
  ): ParsedSessionPolicies | undefined {
    for (const [storedChainId, policies] of Object.entries(chains)) {
      try {
        if (BigInt(storedChainId) === BigInt(chainId)) {
          return policies;
        }
      } catch {
        // Ignore malformed keys.
      }
    }
    return undefined;
  }

  private clearStoredSession(): void {
    localStorage.removeItem("sessionSigner");
    localStorage.removeItem("session");
    localStorage.removeItem("sessionPolicies");
    localStorage.removeItem("lastUsedConnector");
    this._accounts.clear();
  }
}
