export * from "./types";

import { connectToParent } from "@cartridge/penpal";
import Controller from "@/utils/controller";
import { connect } from "./connect";
import { execute } from "./execute";
import { probe } from "./probe";
import { signMessageFactory } from "./sign";
import { ConnectionCtx } from "./types";
import { deployFactory } from "./deploy";
import { openSettingsFactory } from "./settings";
import { normalize } from "@cartridge/utils";

export function connectToController<ParentMethods extends object>({
  setOrigin,
  setRpcUrl,
  setContext,
  setController,
}: {
  setOrigin: (origin: string) => void;
  setRpcUrl: (url: string) => void;
  setContext: (ctx: ConnectionCtx) => void;
  setController: (controller?: Controller) => void;
}) {
  const controller = window.controller as Controller | undefined;

  // Create base methods object
  const methods = {
    connect: normalize(
      connect({
        setOrigin,
        setRpcUrl,
        setContext,
      }),
    ),
    deploy: () => deployFactory(setContext),
    execute: () => execute({ setContext }),
    estimateDeclareFee: () => controller?.estimateDeclareFee,
    estimateInvokeFee: () => controller?.estimateInvokeFee,
    probe: normalize(probe({ setController, setOrigin, setRpcUrl })),
    signMessage: () => signMessageFactory(setContext),
    openSettings: () => openSettingsFactory(setContext),
    reset: () => () => {
      setContext(undefined);
    },
    disconnect: () => async () => {
      setContext(undefined);
      setController(undefined);
    },
    logout: () => async () => {
      setContext(undefined);
      setController(undefined);
    },
    username: () => () => controller?.username(),
    delegateAccount: () => () => controller?.delegateAccount(),
    openPurchaseCredits: () => () => {
      setContext({
        origin,
        type: "open-purchase-credits",
        resolve: () => Promise.resolve(),
        reject: () => Promise.reject(),
      });
    },
  };

  return connectToParent<ParentMethods>({
    methods,
  });
}
