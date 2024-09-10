export * from "./types";

import { ConnectError, Policy, ResponseCodes } from "@cartridge/controller";
import { connectToParent } from "@cartridge/penpal";
import { normalize as normalizeOrigin } from "utils/url";
import Controller from "utils/controller";
import { connectFactory, disconnectFactory } from "./connect";
import { execute } from "./execute";
import { estimateDeclareFee, estimateInvokeFee } from "./estimate";
import { logout } from "./logout";
import { probeFactory } from "./probe";
import { signMessageFactory } from "./sign";
import { username } from "./username";
import { ConnectionCtx } from "./types";
import { openMenuFactory } from "./menu";
import { delegateAccount, setDelegateFactory } from "./delegate";
import { openSettingsFactory } from "./settings";
import { deployFactory } from "./deploy";

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
        connectFactory({
          setOrigin,
          setRpcUrl,
          setPolicies,
          setContext,
        }),
      ),
      disconnect: normalize(validate(disconnectFactory(setController))),
      deploy: normalize(validate(deployFactory(setContext))),
      execute: normalize(validate(execute({ setContext }))),
      estimateDeclareFee: normalize(validate(estimateDeclareFee)),
      estimateInvokeFee: normalize(validate(estimateInvokeFee)),
      logout: normalize(logout),
      probe: normalize(probeFactory({ setController, setRpcUrl })),
      signMessage: normalize(validate(signMessageFactory(setContext))),
      openMenu: normalize(validate(openMenuFactory(setContext))),
      openSettings: normalize(validate(openSettingsFactory(setContext))),
      setDelegate: normalize(validate(setDelegateFactory(setContext))),
      reset: normalize(() => () => setContext(undefined)),
      username: normalize(username),
      delegateAccount: normalize(delegateAccount),
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
    const controller = Controller.fromStore(origin);
    if (!controller) {
      return async () => ({
        code: ResponseCodes.NOT_CONNECTED,
        message: "Controller not found.",
      });
    }

    return fn(controller, origin);
  };
}
