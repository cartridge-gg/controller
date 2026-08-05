import Controller from "compat-controller";

declare const __COMPAT_SDK_VERSION__: string;

const ADDRESS = "0x1111111111111111111111111111111111111111";
const MAINNET_RPC = "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9";
const SEPOLIA_CHAIN_ID = "0x534e5f5345504f4c4941";
const CALL = {
  contractAddress: "0x1",
  entrypoint: "transfer",
  calldata: ["0x2", "0x3"],
};
const TYPED_DATA = {
  types: {
    StarknetDomain: [
      { name: "name", type: "felt" },
      { name: "version", type: "felt" },
      { name: "chainId", type: "felt" },
      { name: "revision", type: "felt" },
    ],
    Message: [{ name: "value", type: "felt" }],
  },
  primaryType: "Message",
  domain: { name: "Compat", version: "1", chainId: "SN_MAIN", revision: "1" },
  message: { value: "0x1" },
};

const ethereum = {
  isMetaMask: true,
  version: "compat-metamask",
  chainId: "0x1",
  on: () => undefined,
  request: async ({ method }: { method: string }) => {
    switch (method) {
      case "eth_accounts":
      case "eth_requestAccounts":
        return [ADDRESS];
      case "personal_sign":
        return "0xexternal-signature";
      case "eth_signTypedData_v4":
        return "0xexternal-typed-signature";
      case "eth_getBalance":
        return "0x2a";
      case "wallet_switchEthereumChain":
        return null;
      case "eth_getTransactionReceipt":
        return { transactionHash: "0xexternal", status: "0x1" };
      case "eth_sendTransaction":
        return "0xexternal";
      default:
        throw new Error(`Unsupported compatibility RPC method: ${method}`);
    }
  },
};
Object.assign(window, { ethereum });

const params = new URLSearchParams(window.location.search);
const keychainUrl = new URL("http://127.0.0.1:4174/compat.html");
const slot = params.get("slot") ?? "legacy-game";
const toriiUrl = params.get("torii") ?? undefined;

const controller = new Controller({
  url: keychainUrl.toString(),
  slot,
  toriiUrl,
  propagateSessionErrors: true,
});

let account: unknown;

async function ready() {
  const started = Date.now();
  while (!controller.isReady()) {
    if (Date.now() - started > 10_000) {
      throw new Error(
        "Timed out waiting for the real Penpal keychain connection",
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}

function rawKeychain(): Record<
  string,
  (...args: unknown[]) => Promise<unknown>
> {
  const keychain = (controller as unknown as { keychain?: unknown }).keychain;
  if (!keychain) throw new Error("SDK keychain proxy is not ready");
  return keychain as Record<string, (...args: unknown[]) => Promise<unknown>>;
}

const api = {
  ready,
  connectInvocation: () =>
    __COMPAT_SDK_VERSION__ === "0.13.12"
      ? "auth-options-array"
      : "connect-options",
  iframeUrl: () =>
    (document.getElementById("controller-keychain") as HTMLIFrameElement)?.src,
  probe: async () => {
    await ready();
    const result = await controller.probe();
    return result ? { address: result.address } : null;
  },
  connectCurrent: async () => {
    await ready();
    account = await controller.connect(
      __COMPAT_SDK_VERSION__ === "0.13.12"
        ? ["password"]
        : { signupOptions: ["password"] },
    );
    return account
      ? { address: (account as { address: string }).address }
      : null;
  },
  connectLegacy: async () => {
    await ready();
    return await rawKeychain().connect(
      { contracts: { "0x1": { methods: [{ entrypoint: "transfer" }] } } },
      MAINNET_RPC,
      ["password"],
    );
  },
  switchChain: async () => {
    await ready();
    return await controller.switchStarknetChain(SEPOLIA_CHAIN_ID);
  },
  execute: async () => {
    if (!account)
      account = await api.connectCurrent().then(() => controller.account);
    return await (
      account as { execute: (calls: unknown) => Promise<unknown> }
    ).execute([CALL]);
  },
  executeRaw: async () => {
    await ready();
    return await rawKeychain().execute([CALL], undefined, undefined, false);
  },
  sign: async () => {
    if (!account)
      account = await api.connectCurrent().then(() => controller.account);
    return await (
      account as { signMessage: (data: unknown) => Promise<unknown> }
    ).signMessage(TYPED_DATA);
  },
  updateSession: async () => {
    await ready();
    try {
      return await rawKeychain().updateSession(
        { contracts: { "0x1": { methods: [{ entrypoint: "mint" }] } } },
        undefined,
      );
    } catch (error) {
      return error;
    }
  },
  estimateFee: async () => {
    await ready();
    return await rawKeychain().estimateInvokeFee([CALL]);
  },
  disconnect: async () => {
    await ready();
    await rawKeychain().disconnect();
    return { resolved: true, at: Date.now() };
  },
};

Object.assign(window, { __controllerBrowserContract: api });
document.getElementById("status")!.textContent = "ready";
