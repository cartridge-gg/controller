import { getToriiUrl } from "@/helpers/torii-url";
import { connectToController } from "@/utils/connection";
import { parseConnectParams } from "@/utils/connection/connect";
import type { HeadlessConnectParent } from "@/utils/connection/headless";
import { parseUpdateSessionParams } from "@/utils/connection/update-session";
import Controller from "@/utils/controller";

type ParentBridge = HeadlessConnectParent & {
  [method: string]: unknown;
};

type CompatState = {
  bootCount: number;
  connected: boolean;
  mode: "success" | "error" | "cancel";
  events: Array<{ name: string; args?: unknown; at: number }>;
  query: Record<string, string | null>;
  toriiUrl: string | null;
};

const STORAGE_KEY = "keychain.browser-contract.state";
const ADDRESS =
  "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd";
const RPC_URL = "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9";
const TX_HASH = "0xabc123";
const SIGNATURE = ["0x111", "0x222"];

function readState(): CompatState {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  const previous = stored ? (JSON.parse(stored) as CompatState) : undefined;
  const params = new URLSearchParams(window.location.search);
  const explicitTorii = params.get("torii");
  const decodedTorii = explicitTorii ? decodeURIComponent(explicitTorii) : null;
  return {
    bootCount: (previous?.bootCount ?? 0) + 1,
    connected: previous?.connected ?? false,
    mode: previous?.mode ?? "success",
    events: previous?.events ?? [],
    query: {
      version: params.get("v"),
      project: params.get("ps"),
      torii: decodedTorii,
    },
    toriiUrl: getToriiUrl(params.get("ps"), decodedTorii),
  };
}

let state = readState();
let parentBridge: (ParentBridge & { origin: string }) | undefined;

function persist() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const target = document.getElementById("compat-state");
  if (target) target.textContent = JSON.stringify(state, null, 2);
}

function record(name: string, args?: unknown) {
  state.events.push({ name, args, at: Date.now() });
  persist();
}

const fakeController = {
  address: () => ADDRESS,
  rpcUrl: () => RPC_URL,
  username: () => "compat-user",
  classHash: () => "0xclass",
  owner: () => ({ signer: { type: "compat" } }),
  disconnect: async () => {
    state.connected = false;
    record("controller.disconnect");
  },
  trySessionExecute: async (_origin: string, calls: unknown) => {
    record("controller.execute", calls);
    if (state.mode === "error") {
      throw {
        code: 777,
        message: "deterministic execution error",
        data: JSON.stringify({ reason: "compat-failure", retryable: false }),
      };
    }
    return { transaction_hash: TX_HASH };
  },
  hasAuthorizedPoliciesForMessage: async () => true,
  signMessage: async (typedData: unknown) => {
    record("controller.signMessage", typedData);
    if (state.mode === "error") {
      throw {
        code: 778,
        message: "deterministic signing error",
        data: JSON.stringify({ reason: "compat-sign-failure" }),
      };
    }
    return SIGNATURE;
  },
  estimateInvokeFee: async (calls: unknown) => {
    record("controller.estimateInvokeFee", calls);
    return {
      l1_gas_consumed: "0x1",
      l1_gas_price: "0x2",
      l2_gas_consumed: "0x3",
      l2_gas_price: "0x4",
      l1_data_gas_consumed: "0x5",
      l1_data_gas_price: "0x6",
      overall_fee: "0x2a",
      unit: "FRI",
    };
  },
};

function installController() {
  window.controller = fakeController as never;
}

Controller.fromStore = async () =>
  state.connected ? (fakeController as never) : undefined;
Controller.create = async (options) => {
  record("controller.create", options);
  return fakeController as never;
};

function navigate(to: string | number) {
  record("navigate", to);
  if (typeof to !== "string") return;

  const url = new URL(to, window.location.origin);
  if (url.pathname === "/connect") {
    const parsed = parseConnectParams(url.searchParams);
    state.connected = true;
    installController();
    record("connect", {
      origin: parentBridge?.origin,
      signupOptions: parsed?.params.signers,
    });
    parsed?.resolve?.({
      code: "SUCCESS",
      address: ADDRESS,
      keepOpen: true,
    });
    return;
  }

  if (url.pathname === "/update-session") {
    const parsed = parseUpdateSessionParams(url.searchParams);
    record("updateSession", parsed?.params);
    parsed?.resolve?.(
      state.mode === "cancel"
        ? { code: "CANCELED", message: "deterministic cancellation" }
        : {
            code: "SUCCESS",
            address: ADDRESS,
            keepOpen: true,
          },
    );
  }
}

installController();
persist();

const connection = connectToController<ParentBridge>({
  setRpcUrl: (rpcUrl) => record("setRpcUrl", rpcUrl),
  setController: (controller) => {
    if (controller) {
      state.connected = true;
      installController();
    }
    record("setController", { connected: Boolean(controller) });
  },
  navigate,
  propagateError: true,
  getParent: () => parentBridge,
  getConnectionState: () => ({
    origin: parentBridge?.origin ?? "",
    chainId: "0x534e5f4d41494e",
    rpcUrl: RPC_URL,
    policies: { verified: true, contracts: {}, messages: [] },
    isPoliciesResolved: true,
    isConfigLoading: false,
  }),
});

void connection.promise.then((parent) => {
  parentBridge = parent as unknown as ParentBridge & { origin: string };
  record("parent.connected", { origin: parent.origin });
});

const api = {
  getState: () => structuredClone(state),
  reset: () => {
    sessionStorage.removeItem(STORAGE_KEY);
    state = readState();
    installController();
    persist();
  },
  setMode: (mode: CompatState["mode"]) => {
    state.mode = mode;
    persist();
  },
  runReverseBridge: async () => {
    if (!parentBridge) throw new Error("Parent bridge is not connected");
    const call = async (method: string, ...args: unknown[]) => {
      const fn = parentBridge?.[method];
      if (typeof fn !== "function") throw new Error(`Missing ${method}`);
      return await fn(...args);
    };
    const result = {
      detected: await call("externalDetectWallets"),
      connected: await call("externalConnectWallet", "metamask"),
      signed: await call("externalSignMessage", "metamask", "hello"),
      typedSigned: await call("externalSignTypedData", "metamask", {
        domain: { name: "Compat" },
        types: {},
        message: {},
      }),
      sent: await call("externalSendTransaction", "metamask", {
        from: "0x1111111111111111111111111111111111111111",
        to: "0x2222222222222222222222222222222222222222",
        value: "0x1",
      }),
      balance: await call("externalGetBalance", "metamask"),
      switched: await call("externalSwitchChain", "metamask", "0x1"),
      waited: await call(
        "externalWaitForTransaction",
        "metamask",
        "0xexternal",
        100,
      ),
    };
    record("reverseBridge", result);
    return result;
  },
};

Object.assign(window, { __keychainBrowserContract: api });
