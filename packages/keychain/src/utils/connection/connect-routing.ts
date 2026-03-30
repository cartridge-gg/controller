import { ResponseCodes } from "@cartridge/controller";
import type {
  AuthOptions,
  ConnectOptions,
  SessionPolicies,
  HeadlessConnectOptions,
  HeadlessConnectReply,
} from "@cartridge/controller";

type NavigateFn = (
  to: string | number,
  options?: { replace?: boolean; state?: unknown },
) => void;

type UiConnectFn = (
  policiesOrOptions?: SessionPolicies | AuthOptions | ConnectOptions,
  rpcUrl?: string,
  signupOptions?: AuthOptions,
) => Promise<unknown>;

type HeadlessConnectFn = (
  options: HeadlessConnectOptions,
) => Promise<HeadlessConnectReply>;

type ParentLike = {
  open?: () => void | Promise<void>;
  onSessionCreated?: () => void | Promise<void>;
};

export function isHeadlessConnectOptions(
  value: unknown,
): value is HeadlessConnectOptions {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return (
    typeof obj.username === "string" &&
    obj.username.length > 0 &&
    typeof obj.signer === "string" &&
    obj.signer.length > 0
  );
}

const safeCall = async (fn?: () => void | Promise<void>, label?: string) => {
  if (!fn) return;
  try {
    await fn();
  } catch (error) {
    console.error(`[connect] ${label ?? "callback"} failed:`, error);
  }
};

export function createConnectHandler({
  uiConnect,
  headlessConnect,
  navigate,
  getParent,
  waitForApproval,
  getConnectedAddress,
}: {
  uiConnect: UiConnectFn;
  headlessConnect: HeadlessConnectFn;
  navigate: NavigateFn;
  getParent: () => ParentLike | undefined;
  waitForApproval: (requestId: string) => Promise<void>;
  getConnectedAddress: () => string | undefined;
}) {
  return async (
    policiesOrOptions?: SessionPolicies | AuthOptions | ConnectOptions,
    rpcUrl?: string,
    signupOptions?: AuthOptions,
  ) => {
    if (!isHeadlessConnectOptions(policiesOrOptions)) {
      return uiConnect(policiesOrOptions, rpcUrl, signupOptions);
    }

    const { username, signer, password } = policiesOrOptions as ConnectOptions;
    const response = await headlessConnect({
      username: username!,
      signer: signer!,
      password,
    });

    if (response.code === ResponseCodes.SUCCESS && "address" in response) {
      await safeCall(
        () => getParent()?.onSessionCreated?.(),
        "onSessionCreated",
      );
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

      await safeCall(() => getParent()?.open?.(), "open");
      await waitForApproval(response.requestId);
      await safeCall(
        () => getParent()?.onSessionCreated?.(),
        "onSessionCreated",
      );

      const address = getConnectedAddress();
      if (!address) {
        throw new Error("Controller not ready after approval");
      }

      return {
        code: ResponseCodes.SUCCESS as const,
        address,
      };
    }

    // response is a ConnectError
    throw response;
  };
}
