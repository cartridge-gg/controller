export * from "./types";

import { ConnectError, Policy, ResponseCodes } from "@cartridge/controller";
import { connectToParent } from "@cartridge/penpal";
import Controller from "utils/controller";
import { connectFactory, disconnectFactory } from "./connect";
import { execute } from "./execute";
import { estimateDeclareFee, estimateInvokeFee } from "./estimate";
import { logout } from "./logout";
import { probeFactory } from "./probe";
import { signMessageFactory } from "./sign";
import { username } from "./username";
import { fetchControllers } from "./fetchControllers";
import { ConnectionCtx } from "./types";
import { deployFactory } from "./deploy";
import { openSettingsFactory } from "./settings";
import { delegateAccount } from "./delegate";
import { normalize } from "@cartridge/utils";

export function connectToController<ParentMethods extends {}>({
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
  return connectToParent<ParentMethods>({
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
      openSettings: normalize(validate(openSettingsFactory(setContext))),
      openMenu: normalize(validate(openSettingsFactory(setContext))), // Deprecated in v0.3.44, calls openSettings
      reset: normalize(() => () => setContext(undefined)),
      username: normalize(username),
      fetchControllers: normalize(fetchControllers),
      delegateAccount: normalize(delegateAccount),
    },
  });
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
