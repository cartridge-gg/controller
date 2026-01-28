import SessionProvider, {
  type ControllerError,
} from "@cartridge/controller/session";
import { ec, stark, constants } from "starknet";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

const RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9";
const STRK_CONTRACT_ADDRESS =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const SESSION_SIGNER_KEY = "sessionSigner";
const SESSION_POLICIES_KEY = "sessionPolicies";
const REDIRECT_SCHEME = "cartridge-session";

const connectButton = document.querySelector<HTMLButtonElement>("#connect");
const executeButton = document.querySelector<HTMLButtonElement>("#execute");
const status = document.querySelector<HTMLDivElement>("#status");

if (!connectButton || !executeButton || !status) {
  throw new Error("Missing UI elements");
}

const setStatus = (message: string) => {
  status.textContent = message;
};

const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const controllerError = error as ControllerError;
    if (controllerError.code || controllerError.message || controllerError.data) {
      return JSON.stringify(
        {
          code: controllerError.code,
          message: controllerError.message,
          data: controllerError.data,
        },
        (_key, value) => (typeof value === "bigint" ? value.toString() : value),
        2,
      );
    }

    try {
      return JSON.stringify(
        error,
        (_key, value) => (typeof value === "bigint" ? value.toString() : value),
        2,
      );
    } catch {
      return Object.prototype.toString.call(error);
    }
  }

  return String(error);
};

window.addEventListener("error", (event) => {
  console.error("Unhandled error:", event.error || event.message);
  setStatus(`Startup error: ${formatError(event.error || event.message)}`);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled rejection:", event.reason);
  setStatus(`Startup error: ${formatError(event.reason)}`);
});

if (Capacitor.isNativePlatform()) {
  const originalOpen = window.open;
  window.open = ((url: string | URL) => {
    Browser.open({ url: url.toString() }).catch((error) => {
      console.warn("Failed to open browser", error);
    });
    return null as Window | null;
  }) as typeof window.open;

  window.addEventListener("beforeunload", () => {
    window.open = originalOpen;
  });
}

const policies = {
  contracts: {
    [STRK_CONTRACT_ADDRESS]: {
      methods: [{ name: "transfer", entrypoint: "transfer" }],
    },
  },
};

const provider = new SessionProvider({
  rpc: RPC_URL,
  chainId: constants.StarknetChainId.SN_SEPOLIA,
  redirectUrl: Capacitor.isNativePlatform()
    ? `${REDIRECT_SCHEME}://session`
    : window.location.origin,
  policies,
});

let account: Awaited<ReturnType<typeof provider.connect>> | undefined;

const buildAuthorizedPolicies = () => ({
  verified: false,
  contracts: policies.contracts
    ? Object.fromEntries(
        Object.entries(policies.contracts).map(([address, contract]) => [
          address,
          {
            ...contract,
            methods: contract.methods.map((method) => ({
              ...method,
              authorized: true,
            })),
          },
        ]),
      )
    : undefined,
  messages: undefined,
});

const ensureSessionSigner = (): string => {
  const existing = localStorage.getItem(SESSION_SIGNER_KEY);
  if (existing) {
    const parsed = JSON.parse(existing) as { privKey: string; pubKey: string };
    return parsed.pubKey;
  }

  const privKey = stark.randomAddress();
  const pubKey = ec.starkCurve.getStarkKey(privKey);
  localStorage.setItem(
    SESSION_SIGNER_KEY,
    JSON.stringify({ privKey, pubKey }),
  );
  return pubKey;
};

const openKeychainSession = async () => {
  const publicKey = ensureSessionSigner();
  localStorage.setItem(
    SESSION_POLICIES_KEY,
    JSON.stringify(buildAuthorizedPolicies()),
  );

  const redirectUrl = `${REDIRECT_SCHEME}://session`;
  const params = new URLSearchParams({
    public_key: publicKey,
    redirect_uri: redirectUrl,
    redirect_query_name: "startapp",
    policies: JSON.stringify(policies),
    rpc_url: RPC_URL,
  });

  const url = `https://x.cartridge.gg/session?${params.toString()}`;
  setStatus(`Opening browser: ${url}`);
  if (Capacitor.isNativePlatform()) {
    try {
      await App.openUrl({ url });
      return;
    } catch (error) {
      console.error("App.openUrl failed, falling back to Browser.open", error);
    }
  }

  try {
    await Browser.open({ url });
  } catch (error) {
    console.error("Browser.open failed, falling back to window.location", error);
    setStatus(`Browser open failed: ${formatError(error)}`);
    window.location.href = url;
  }
};

const handleDeepLink = async (url: string) => {
  try {
    const parsed = new URL(url);
    const startapp = parsed.searchParams.get("startapp");
    if (!startapp) {
      return;
    }

    const stored = provider.ingestSessionFromRedirect(startapp);
    if (!stored) {
      throw new Error("Invalid session payload");
    }

    await Browser.close().catch(() => undefined);
    account = await provider.probe();
    if (account) {
      setStatus(`Session ready. Address: ${account.address}`);
      executeButton.disabled = false;
    } else {
      setStatus("Session stored but account not ready yet.");
    }
  } catch (error) {
    console.error("Failed to handle deep link", error);
    setStatus(`Deep link error: ${formatError(error)}`);
  } finally {
    connectButton.disabled = false;
  }
};

if (Capacitor.isNativePlatform()) {
  try {
    App.addListener("appUrlOpen", ({ url }) => {
      if (url) {
        handleDeepLink(url);
      }
    });
  } catch (error) {
    console.error("Failed to register appUrlOpen listener", error);
    setStatus(`Listener error: ${formatError(error)}`);
  }
}

connectButton.addEventListener("click", async () => {
  setStatus("Opening session authorization...");
  connectButton.disabled = true;
  try {
    if (Capacitor.isNativePlatform()) {
      await openKeychainSession();
      setStatus("Authorize the session in the browser, then return to the app.");
    } else {
      account = await provider.connect();
      if (!account) {
        setStatus(
          "Session not ready yet. Complete authorization in the browser and return to the app.",
        );
        connectButton.disabled = false;
        return;
      }
      setStatus(`Session ready. Address: ${account.address}`);
      executeButton.disabled = false;
    }
  } catch (error: unknown) {
    console.error("Session connect error:", error);
    setStatus(`Session error: ${formatError(error)}`);
    connectButton.disabled = false;
  }
});

executeButton.addEventListener("click", async () => {
  if (!account) {
    const existing = await provider.probe();
    if (!existing) {
      setStatus("No session account available");
      return;
    }
    account = existing;
    setStatus(`Session ready. Address: ${account.address}`);
  }

  setStatus("Submitting transfer...");
  executeButton.disabled = true;
  try {
    const recipient = account.address;
    const amount = "0x0";
    const result = await account.execute([
      {
        contractAddress: STRK_CONTRACT_ADDRESS,
        entrypoint: "transfer",
        calldata: [recipient, amount, "0x0"],
      },
    ]);
    setStatus(`Transaction submitted: ${result.transaction_hash}`);
  } catch (error: unknown) {
    console.error("Execute error:", error);
    setStatus(`Execute error: ${formatError(error)}`);
  } finally {
    executeButton.disabled = false;
  }
});

provider.probe().then((existing) => {
  if (existing) {
    account = existing;
    setStatus(`Session ready. Address: ${account.address}`);
    executeButton.disabled = false;
  }
});
