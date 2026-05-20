import Controller from "@/utils/controller";
import { connectToParent } from "@cartridge/penpal";
import { normalize } from "@cartridge/controller-ui/utils";
import { connect } from "./connect";
import { deployFactory } from "./deploy";
import { estimateInvokeFee } from "./estimate";
import { execute } from "./execute";
import type {
  HeadlessConnectParent,
  HeadlessConnectionState,
} from "./headless";
import { headlessConnect } from "./headless";
import { probe } from "./probe";
import { openSettingsFactory } from "./settings";
import { signMessageFactory } from "./sign";
import { switchChain } from "./switchChain";
import { navigateFactory } from "./navigate";
import { updateSession } from "./update-session";
import type {
  AuthOptions,
  BundleOptions,
  ConnectOptions,
  LocationGateOptions,
  SessionPolicies,
  StarterpackOptions,
} from "@cartridge/controller";
import { waitForHeadlessApprovalRequest } from "./headless-requests";
import { createConnectHandler } from "./connect-routing";
import { locationPromptFactory } from "./location";
import { PRESERVE_URL_PARAMS_FLAG } from "@/hooks/connection";

export type { ControllerError } from "./execute";

type MerkleDropsRouteOptions = {
  title?: string;
  description?: string;
  preimage?: string;
};

const LEGACY_STARTERPACK_MERKLE_DROPS: Record<
  string,
  { keys: string[]; title: string; description?: string }
> = {
  "pirate-nation-claim-mainnet": {
    keys: ["priate-nation"],
    title: "Pirate Nation",
    description: "Claim games and tokens Pirate Nation holders",
  },
};

function merkleDropsPath(keys: string[], options?: MerkleDropsRouteOptions) {
  const searchParams = new URLSearchParams();

  if (options?.title) {
    searchParams.set("title", options.title);
  }
  if (options?.description) {
    searchParams.set("description", options.description);
  }
  if (options?.preimage) {
    searchParams.set("preimage", options.preimage);
  }

  const query = searchParams.toString();
  const encodedKeys = keys.map((key) => encodeURIComponent(key)).join(";");
  return `/purchase/merkle-drops/${encodedKeys}${query ? `?${query}` : ""}`;
}

export function connectToController<
  ParentMethods extends HeadlessConnectParent,
>({
  setRpcUrl,
  setController,
  navigate,
  propagateError,
  errorDisplayMode,
  getParent,
  getConnectionState,
  getLocationGate,
  resetLocationGateVerified,
}: {
  setRpcUrl: (url: string) => void;
  setController: (controller?: Controller) => void;
  navigate: (
    to: string | number,
    options?: { replace?: boolean; state?: unknown },
  ) => void;
  propagateError?: boolean;
  errorDisplayMode?: "modal" | "notification" | "silent";
  getParent: () => ParentMethods | undefined;
  getConnectionState: () => HeadlessConnectionState;
  getLocationGate?: () => LocationGateOptions | undefined;
  resetLocationGateVerified?: () => void;
}) {
  const uiConnect = connect({
    navigate,
    setRpcUrl,
    getLocationGate,
    resetLocationGateVerified,
  });

  const headlessConnectImpl = headlessConnect({
    setController,
    getParent,
    getConnectionState,
    getLocationGate,
  });

  return connectToParent<ParentMethods>({
    methods: {
      connect: normalize((origin) => {
        const uiConnectFn = uiConnect();
        const headlessConnectFn = headlessConnectImpl(origin);

        return async (
          policiesOrOptions?: SessionPolicies | AuthOptions | ConnectOptions,
          rpcUrl?: string,
          signupOptions?: AuthOptions,
        ) => {
          const handler = createConnectHandler({
            uiConnect: uiConnectFn,
            headlessConnect: headlessConnectFn,
            navigate,
            getParent,
            waitForApproval: waitForHeadlessApprovalRequest,
            getConnectedAddress: () => window.controller?.address?.(),
          });

          return handler(policiesOrOptions, rpcUrl, signupOptions);
        };
      }),
      deploy: () => deployFactory({ navigate }),
      execute: normalize(
        execute({ navigate, propagateError, errorDisplayMode }),
      ),
      estimateInvokeFee: () => estimateInvokeFee,
      probe: normalize(probe({ setController })),
      signMessage: normalize(
        signMessageFactory({
          navigate,
        }),
      ),
      openSettings: () => openSettingsFactory(),
      navigate: () => navigateFactory(),
      reset: () => () => {
        // Reset handled by navigation
      },
      disconnect: () => async () => {
        // First clear the React state. Order preserved from #1322 so reactive
        // observers (e.g. PostHogProvider's useEffect on `controller`) see the
        // transition to undefined while window.controller is still live.
        setController(undefined);
        // Then cleanup the controller
        await window.controller?.disconnect();
        // Single-shot flag the boot path consumes to keep the cached urlParams
        // snapshot through the reload (policies/preset/etc. survive reconnect).
        // Fresh tab loads or host-page reloads won't have this flag set, so
        // their snapshot is wiped — see initialStoredUrlParams in connection.ts.
        try {
          sessionStorage.setItem(PRESERVE_URL_PARAMS_FLAG, "1");
        } catch {
          // sessionStorage may be unavailable
        }
        // Reload the iframe so the next bootstrap (main.tsx -> Controller.fromStore)
        // runs against cleared storage and lands on a fresh login, matching the
        // internal "Log out" flow (packages/keychain/src/hooks/connection.ts).
        window.location.reload();
      },
      logout: () => async () => {
        // First clear the React state
        setController(undefined);
        // Then cleanup the controller
        await window.controller?.disconnect();
      },
      username: () => () => window.controller?.username(),
      delegateAccount: () => () => window.controller?.delegateAccount(),
      openPurchaseCredits: () => () => {
        navigate("/funding", { replace: true });
      },
      openBundle:
        () => (id: number, registryAddress: string, options: BundleOptions) => {
          const searchParams: string[] = [`registryAddress=${registryAddress}`];
          if (options?.socialClaimOptions) {
            searchParams.push(
              `shareMessage=${encodeURIComponent(options.socialClaimOptions.shareMessage)}`,
            );
          }
          navigate(
            `/purchase/bundle/${id}${searchParams.length > 0 ? `?${searchParams.join("&")}` : ""}`,
            { replace: true },
          );
        },
      openStarterPack:
        () => (id: string | number, options?: StarterpackOptions) => {
          const legacyMerkleDrops = LEGACY_STARTERPACK_MERKLE_DROPS[String(id)];
          if (legacyMerkleDrops) {
            navigate(
              merkleDropsPath(legacyMerkleDrops.keys, {
                title: legacyMerkleDrops.title,
                description: legacyMerkleDrops.description,
                preimage: options?.preimage,
              }),
              { replace: true },
            );
            return;
          }

          const searchParams: string[] = [];
          if (options?.preimage) {
            searchParams.push(`preimage=${options.preimage}`);
          }
          navigate(
            `/purchase/starterpack/${id}${searchParams.length > 0 ? `?${searchParams.join("&")}` : ""}`,
            { replace: true },
          );
        },
      openMerkleDrops:
        () => (keys: string[], options?: MerkleDropsRouteOptions) => {
          navigate(merkleDropsPath(keys, options), { replace: true });
        },
      openLocationPrompt: () => locationPromptFactory({ navigate }),
      switchChain: () => switchChain({ setController, setRpcUrl }),
      updateSession: updateSession({ navigate }),
    },
  });
}
