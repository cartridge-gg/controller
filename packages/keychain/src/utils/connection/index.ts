import Controller from "@/utils/controller";
import { connectToParent } from "@cartridge/penpal";
import { normalize } from "@cartridge/ui/utils";
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
import { ResponseCodes } from "@cartridge/controller";
import type {
  AuthOptions,
  ConnectOptions,
  SessionPolicies,
  StarterpackOptions,
} from "@cartridge/controller";
import { waitForHeadlessApprovalRequest } from "./headless-requests";

export type { ControllerError } from "./execute";

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
}) {
  const uiConnect = connect({
    navigate,
    setRpcUrl,
  });

  const headlessConnectImpl = headlessConnect({
    setController,
    getParent,
    getConnectionState,
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
          const maybeOptions = policiesOrOptions as ConnectOptions | undefined;
          const isHeadlessOptions =
            !!maybeOptions &&
            typeof maybeOptions === "object" &&
            !Array.isArray(maybeOptions) &&
            "username" in maybeOptions &&
            "signer" in maybeOptions;

          if (isHeadlessOptions) {
            const { username, signer, password } =
              maybeOptions as ConnectOptions;

            const response = await headlessConnectFn({
              username: username!,
              signer: signer!,
              password,
            });

            if (
              response.code === ResponseCodes.SUCCESS &&
              "address" in response
            ) {
              // Let the parent controller probe and update its connected account.
              await getParent()?.onSessionCreated?.();
              return {
                code: ResponseCodes.SUCCESS as const,
                address: response.address,
              };
            }

            if (
              response.code === ResponseCodes.USER_INTERACTION_REQUIRED &&
              "requestId" in response
            ) {
              navigate(`/headless-approval/${response.requestId}`, {
                replace: true,
              });
              await getParent()?.open?.();
              await waitForHeadlessApprovalRequest(response.requestId);

              if (!window.controller) {
                throw new Error("Controller not ready after approval");
              }

              return {
                code: ResponseCodes.SUCCESS as const,
                address: window.controller.address(),
              };
            }

            // response is a ConnectError
            throw response;
          }

          return uiConnectFn(policiesOrOptions, rpcUrl, signupOptions);
        };
      }),
      headlessConnect: normalize(
        headlessConnect({
          setController,
          getParent,
          getConnectionState,
        }),
      ),
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
        // First clear the React state
        setController(undefined);
        // Then cleanup the controller
        await window.controller?.disconnect();
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
      openStarterPack:
        () => (id: string | number, options?: StarterpackOptions) => {
          navigate(
            `/purchase/starterpack/${id}${options?.preimage ? `?preimage=${options.preimage}` : ""}`,
            { replace: true },
          );
        },
      switchChain: () => switchChain({ setController, setRpcUrl }),
    },
  });
}
