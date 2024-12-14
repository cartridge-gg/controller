export * from "./types";

import { connectToParent } from "@cartridge/penpal";
import Controller from "@/utils/controller";
import { connect } from "./connect";
import { execute } from "./execute";
import { estimateDeclareFee, estimateInvokeFee } from "./estimate";
import { probeFactory } from "./probe";
import { signMessageFactory } from "./sign";
import { fetchControllers } from "./fetchControllers";
import { ConnectionCtx } from "./types";
import { deployFactory } from "./deploy";
import { openSettingsFactory } from "./settings";
import { normalize } from "@cartridge/utils";
import { ParsedSessionPolicies } from "@/hooks/session";

export function connectToController<ParentMethods extends object>({
  setOrigin,
  setRpcUrl,
  setPolicies,
  setContext,
  setController,
}: {
  setOrigin: (origin: string) => void;
  setRpcUrl: (url: string) => void;
  setPolicies: (policies: ParsedSessionPolicies) => void;
  setContext: (ctx: ConnectionCtx) => void;
  setController: (controller?: Controller) => void;
}) {
  return connectToParent<ParentMethods>({
    methods: {
      connect: normalize(
        connect({
          setOrigin,
          setRpcUrl,
          setPolicies,
          setContext,
        }),
      ),
      deploy: () => deployFactory(setContext),
      execute: () => execute({ setContext }),
      estimateDeclareFee: () => estimateDeclareFee,
      estimateInvokeFee: () => estimateInvokeFee,
      probe: normalize(probeFactory({ setController, setRpcUrl })),
      signMessage: () => signMessageFactory(setContext),
      openSettings: () => openSettingsFactory(setContext),
      reset: () => () => setContext(undefined),
      fetchControllers,
      disconnect: () => () => {
        window.controller?.disconnect().then(() => {
          setController(undefined);
        });
      },
      logout: () => () => {
        window.controller?.disconnect().then(() => {
          setController(undefined);
        });
      },
      username: () => () => window.controller?.username(),
      delegateAccount: () => () => window.controller?.delegateAccount(),
      openPurchaseCredits: () => () => {
        setContext({
          origin,
          type: "open-purchase-credits",
          resolve: () => Promise.resolve(),
          reject: () => Promise.reject(),
        });
      },
    },
  });
}
