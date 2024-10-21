export * from "./types";

import { Policy } from "@cartridge/controller";
import { connectToParent } from "@cartridge/penpal";
import Controller from "utils/controller";
import { connectFactory } from "./connect";
import { execute } from "./execute";
import { probeFactory } from "./probe";
import { signMessageFactory } from "./sign";
import { fetchControllers } from "./fetchControllers";
import { ConnectionCtx } from "./types";
import { deployFactory } from "./deploy";
import { openSettingsFactory } from "./settings";
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
      deploy: () => deployFactory(setContext),

      execute: () => execute({ setContext }),
      signMessage: () => signMessageFactory(setContext),

      probe: normalize(probeFactory({ setController, setRpcUrl })),
      openSettings: () => openSettingsFactory(setContext),
      reset: () => () => setContext(undefined),
      fetchControllers: fetchControllers,
      disconnect: () => () => {
        window.controller?.disconnect();
        setController(undefined);
      },
      logout: () => () => {
        window.controller?.disconnect();
        setController(undefined);
      },
      username: () => () => window.controller?.username(),
      delegateAccount: () => () => window.controller?.delegateAccount(),
    },
  });
}
