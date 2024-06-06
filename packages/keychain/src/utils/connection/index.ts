export * from "./types";

import { ConnectError, Policy, ResponseCodes } from "@cartridge/controller";
import { connectToParent } from "@cartridge/penpal";
import { normalize as normalizeOrigin } from "utils/url";
import Controller from "utils/controller";
import { connectFactory, disconnectFactory } from "./connect";
import { executeFactory } from "./execute";
import { estimateDeclareFee, estimateInvokeFee } from "./estimate";
import { logout } from "./logout";
import { probe } from "./probe";
import { revoke, session, sessions } from "./sessions";
import { signMessageFactory } from "./sign";
import { username } from "./username";
import { ConnectionCtx } from "./types";

export function connectToController({
  setOrigin,
  setRpcUrl,
  setPolicies,
  setContext,
  setController,
}: {
  setOrigin: (origin: string) => void;
  setRpcUrl: (url: string) => void;
  setPolicies: (policies: Policy[]) => void;
  setContext: (ctx: ConnectionCtx) => void;
  setController: (controller: Controller) => void;
}) {
  return connectToParent({
    methods: {
      connect: normalize(
        connectFactory({ setOrigin, setRpcUrl, setPolicies, setContext }),
      ),
      disconnect: normalize(validate(disconnectFactory(setController))),
      execute: normalize(validate(executeFactory({ setContext }))),
      estimateDeclareFee: normalize(validate(estimateDeclareFee)),
      estimateInvokeFee: normalize(validate(estimateInvokeFee)),
      logout: normalize(logout),
      probe: normalize(validate(probe)),
      revoke: normalize(revoke),
      signMessage: normalize(validate(signMessageFactory(setContext))),
      session: normalize(session),
      sessions: normalize(sessions),
      reset: normalize(() => () => setContext(undefined)),
      username: normalize(username),
    },
  });
}

function normalize<Promise>(
  fn: (origin: string) => Promise,
): (origin: string) => Promise {
  return (origin: string) => fn(normalizeOrigin(origin));
}

function validate<T>(
  fn: (controller: Controller, origin: string) => T,
): (origin: string) => T | (() => Promise<ConnectError>) {
  return (origin: string) => {
    const controller = Controller.fromStore();
    if (!controller) {
      return async () => ({
        code: ResponseCodes.NOT_CONNECTED,
        message: "Controller not found.",
      });
    }

    return fn(controller, origin);
  };
}
